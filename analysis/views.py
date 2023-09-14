#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided views for the 'analysis' page
# ------------------------------------------------------------------------------------------------
# Notes: This is one part of the serverside module that allows the user to interact with the
#        'analysis' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries, logging libs and 'datamanagement'-folder's 'forms',
#             'models', 'helpers' and 'users'-folder's 'models'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django import forms
from django.contrib import messages
from django.db.models import Q
from django.shortcuts import render

from django.views.generic import CreateView
from django.views.generic import DetailView
from django.views.generic import DeleteView
from django.views.generic import UpdateView
from django.views.generic import TemplateView
from django.urls import reverse
from django.urls import reverse_lazy

from django_filters.views import FilterView
from django_tables2.config import RequestConfig
from django_tables2.views import SingleTableMixin
from rules.contrib.views import PermissionRequiredMixin

from common.helpers import OwnedResourceModelFilter
from .forms import WorkspaceForm

from .models import Workspace
from .helpers import WorkspaceTable
from users.models import User

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def index(request):
    return render(request, "analysis/index.html")
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class WorkspaceActionMixin:
    @property
    def success_msg(self):
        return NotImplemented

    def get_context_data(self, **kwargs):
        context = super(WorkspaceActionMixin, self).get_context_data(**kwargs)
        form = context["form"]
        form.fields["owner"].widget = forms.HiddenInput()
        context["form"] = form
        return context

    def get_success_url(self):
        url = reverse_lazy("analysis:workspace-detail", kwargs={"id": self.object.id})
        return url

    def get_form_kwargs(self, *args, **kwargs):
        kwargs = super().get_form_kwargs(*args, **kwargs)
        return kwargs

    def form_valid(self, form):
        response = super().form_valid(form)

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
class FilteredWorkspaceListView(SingleTableMixin, FilterView):
    model = Workspace
    table_class = WorkspaceTable
    template_name = "analysis/index.html"

    paginate_by = 10
    filterset_class = OwnedResourceModelFilter
    ordering = ["-id"]

    def get_queryset(self):
        # Fetch only accessible data sources
        queryset = super().get_queryset()

        u = self.request.user
        g = list(u.groups.all())

        if u.is_anonymous:
            return Workspace.objects.filter(
                accessibility=Workspace.ACCESSIBILITY_PUBLIC
            )

        queryset = queryset.filter(
            Q(owner=u)
            | Q(accessibility=Workspace.ACCESSIBILITY_PUBLIC)
            | (
                Q(accessibility=Workspace.ACCESSIBILITY_INTERNAL)
                & (Q(shared_users__in=[u]) | Q(shared_groups__in=g))
            )
        ).distinct()

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        qs = self.get_queryset()
        if self.request.user.is_anonymous:
            num_of_owned = 0
        else:
            num_of_owned = qs.filter(owner=self.request.user).count()

        num_of_all = qs.count()
        context["num_of_owned"] = num_of_owned
        context["num_of_shared"] = num_of_all - num_of_owned

        return context
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class WorkspaceCreateView(PermissionRequiredMixin, WorkspaceActionMixin, CreateView):
    model = Workspace
    form_class = WorkspaceForm
    template_name = "analysis/workspace_create.html"
    success_url = reverse_lazy("analysis:index")
    success_msg = "New workspace is saved."
    permission_required = "analysis.add_workspace"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        form = WorkspaceForm(initial={"owner": self.request.user})
        form.fields["owner"].widget = forms.HiddenInput()
        context["form"] = form

        return context
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class WorkspaceDetailView(PermissionRequiredMixin, DetailView):
    # model = Book
    model = Workspace
    pk_url_kwarg = "id"
    permission_required = "analysis.read_workspace"

    def get_success_url(self):
        url = reverse_lazy("analysis:workspace-detail", kwargs={"id": self.object.id})
        return url

    def get_form_kwargs(self, *args, **kwargs):
        kwargs = super().get_form_kwargs(*args, **kwargs)
        return kwargs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        return context
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class WorkspaceUpdateView(PermissionRequiredMixin, WorkspaceActionMixin, UpdateView):
    model = Workspace
    form_class = WorkspaceForm
    pk_url_kwarg = "id"
    template_name = "analysis/workspace_update.html"
    success_msg = "The workspace is updated."
    permission_required = "analysis.change_workspace"

    # fields = ('name', 'description', 'file', 'accessibility',
    #           'shared_users', 'shared_groups', 'users_hidden', 'groups_hidden', )
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class WorkspaceDeleteView(PermissionRequiredMixin, DeleteView):
    model = Workspace
    pk_url_kwarg = "id"
    success_url = reverse_lazy("analysis:index")
    permission_required = "analysis.delete_workspace"

    def delete(self, request, *args, **kwargs):
        result = super().delete(request, *args, **kwargs)
        messages.success(self.request, "The workspace is deleted.")
        return result
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class WorkspaceNewView(PermissionRequiredMixin, WorkspaceActionMixin, TemplateView):
    template_name = "analysis/workspace_default.html"
    permission_required = "analysis.add_workspace"

    def get_context_data(self, **kwargs):
        context = {}

        return context
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class WorkspaceNewUnauthorizedView(WorkspaceActionMixin, TemplateView):
    template_name = "analysis/workspace_default.html"

    def get_context_data(self, **kwargs):
        context = {}

        return context
#-------------------------------------------------------------------------------------------------
