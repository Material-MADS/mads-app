#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Jun Fujima (Former Lead Developer) [2018-2021]
#          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided views for the 'datamanagement' page
# ------------------------------------------------------------------------------------------------
# Notes: This is one part of the serverside module that allows the user to interact with the
#        'datamanagement' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries, logging libs and 'datamanagement'-folder's 'forms',
#             'models', 'helpers' and 'users'-folder's 'models'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django import forms
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import permission_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from django.shortcuts import redirect
from django.shortcuts import render
from django.urls import reverse
from django.urls import reverse_lazy
from django.views.decorators.http import require_POST
from django.views.generic import CreateView
from django.views.generic import DeleteView
from django.views.generic import DetailView
from django.views.generic import UpdateView

from django.http import HttpResponse
from django.http import HttpResponseNotFound
from django.http import HttpResponseNotAllowed
from django.http import HttpResponseServerError

from django_filters.views import FilterView
from django_tables2.config import RequestConfig
from django_tables2.views import SingleTableMixin
from django_tables2.views import SingleTableView
from rules.contrib.views import PermissionRequiredMixin
from rules.contrib.views import LoginRequiredMixin

from common.helpers import get_contents_from_file
from .forms import DataSourceForm
from .models import DataSource
from .helpers import DataSourceTable
from .helpers import DataSourceFilter
from .helpers import DataSourceFilterHelper
from users.models import User

import rules

from logging import getLogger

logger = getLogger(__name__)

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class DataSourceActionMixin:
    @property
    def success_msg(self):
        return NotImplemented

    def get_context_data(self, **kwargs):
        context = super(DataSourceActionMixin, self).get_context_data(**kwargs)
        form = context["form"]
        form.fields["owner"].widget = forms.HiddenInput()
        context["form"] = form
        return context

    def get_success_url(self):
        url = reverse_lazy(
            "datamanagement:datasource-detail", kwargs={"id": self.object.id}
        )
        return url

    def get_form_kwargs(self, *args, **kwargs):
        kwargs = super().get_form_kwargs(*args, **kwargs)
        return kwargs

    def form_valid(self, form):
        response = super(DataSourceActionMixin, self).form_valid(form)

        self.object.shared_users.clear()
        for user in form.users:
            self.object.shared_users.add(user)

        self.object.shared_groups.clear()
        for group in form.groups:
            self.object.shared_groups.add(group)

        messages.info(self.request, self.success_msg)
        return response
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class FilteredDataSourceListView(SingleTableMixin, FilterView):
    table_class = DataSourceTable
    model = DataSource
    template_name = "datamanagement/index.html"
    table_pagination = {"per_page": 10}

    filterset_class = DataSourceFilter
    ordering = ["-id"]

    formhelper_class = DataSourceFilterHelper

    def get_queryset(self):

        # Fetch only accessible data sources
        queryset = super(FilteredDataSourceListView, self).get_queryset()

        u = self.request.user
        g = list(u.groups.all())

        if u.is_anonymous:
            return DataSource.objects.filter(
                accessibility=DataSource.ACCESSIBILITY_PUBLIC
            )

        queryset = queryset.filter(
            Q(owner=u)
            | Q(accessibility=DataSource.ACCESSIBILITY_PUBLIC)
            | (
                Q(accessibility=DataSource.ACCESSIBILITY_INTERNAL)
                & (Q(shared_users__in=[u]) | Q(shared_groups__in=g))
            )
        ).distinct()

        return queryset

    def get_context_data(self, **kwargs):
        context = super(FilteredDataSourceListView, self).get_context_data(**kwargs)
        qs = self.get_queryset()
        if self.request.user.is_anonymous:
            num_of_owned = 0
        else:
            num_of_owned = qs.filter(owner=self.request.user).count()

        num_of_all = qs.count()
        context["num_of_owned"] = num_of_owned
        context["num_of_shared"] = num_of_all - num_of_owned

        context["lll"] = context["object_list"].count()
        context["dll"] = len(context["datasource_list"])
        context["qll"] = qs.count()
        context["object_list"] = qs
        context["datasource_list"] = qs
        return context
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class DataSourceDetailView(PermissionRequiredMixin, DetailView):
    # model = Book
    model = DataSource
    pk_url_kwarg = "id"
    permission_required = "datamanagement.read_datasource"

    def get_success_url(self):
        url = reverse_lazy(
            "datamanagement:datasource-detail", kwargs={"id": self.object.id}
        )
        return url

    def get_form_kwargs(self, *args, **kwargs):
        kwargs = super().get_form_kwargs(*args, **kwargs)
        return kwargs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # read contents if the file is CSS or EXCEL
        context["file"] = context["object"].file

        contents, file_type, columns = get_contents_from_file(context["object"].file)

        context["contents"] = contents
        context["file_type"] = file_type
        context["columns"] = columns

        return context
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class DataSourceCreateView(LoginRequiredMixin, DataSourceActionMixin, CreateView):
    model = DataSource
    form_class = DataSourceForm
    pk_url_kwarg = "id"
    template_name = "datamanagement/datasource_add.html"
    # success_url = reverse_lazy('datamanagement:index')
    success_msg = "New data source is saved."
    permission_required = "datamanagement.add_datasource"

    def get_initial(self):
        context = super().get_initial()
        context["owner"] = self.request.user

        return context
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class DataSourceUpdateView(PermissionRequiredMixin, DataSourceActionMixin, UpdateView):
    model = DataSource
    form_class = DataSourceForm
    pk_url_kwarg = "id"
    template_name = "datamanagement/datasource_update.html"
    success_msg = "The data source is updated."
    permission_required = "datamanagement.change_datasource"
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class DataSourceDeleteView(PermissionRequiredMixin, DeleteView):
    model = DataSource
    pk_url_kwarg = "id"
    success_url = reverse_lazy("datamanagement:index")
    permission_required = "datamanagement.delete_datasource"

    def delete(self, request, *args, **kwargs):
        result = super().delete(request, *args, **kwargs)
        messages.success(self.request, "The data source is deleted.")
        return result
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_data(request, id):

    target = DataSource.objects.get(id=id)

    if target is None:
        return HttpResponseNotFound("The resource is not found.")

    if not rules.test_rule("can_read_datasource", request.user, target):
        return HttpResponseNotAllowed("Access denied.")

    logger.info(request.user.id)
    logger.info(target.name)

    contents, file_type, columns = get_contents_from_file(target.file)

    if file_type == "csv":
        return HttpResponse(contents)

    return HttpResponseServerError("The file type is not supported.")
#-------------------------------------------------------------------------------------------------
