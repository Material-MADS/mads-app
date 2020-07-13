from django import forms
from django.contrib import messages
from django.db.models import Q
from django.shortcuts import render

from django.views.generic import CreateView
from django.views.generic import DetailView
from django.views.generic import DeleteView
from django.views.generic import UpdateView
from django.views.generic.edit import ModelFormMixin
from django.urls import reverse
from django.urls import reverse_lazy

from django_filters.views import FilterView
from django_tables2.config import RequestConfig
from django_tables2.views import SingleTableMixin
from rules.contrib.views import PermissionRequiredMixin

from common.helpers import OwnedResourceModelFilter
from .forms import PredictionForm
from .forms import PretrainedModelForm

# from .helpers import get_contents_from_file

from .models import PretrainedModel
from .helpers import PretrainedModelTable
from users.models import User

import logging
logger = logging.getLogger(__name__)


# Create your views here.
def index(request):
    return render(request, 'prediction/index.html')

class PModelActionMixin:

    @property
    def success_msg(self):
        return NotImplemented

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        form = context['form']
        form.fields['owner'].widget = forms.HiddenInput()
        context['form'] = form
        return context

    def get_success_url(self):
        url = reverse_lazy('prediction:model-detail',
                           kwargs={'id': self.object.id})
        return url

    def get_form_kwargs(self, *args, **kwargs):
        kwargs = super().get_form_kwargs(
            *args, **kwargs)
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


class FilteredPModelListView(SingleTableMixin, FilterView):
    model = PretrainedModel
    table_class = PretrainedModelTable
    template_name = 'prediction/index.html'

    paginate_by = 10
    filterset_class = OwnedResourceModelFilter
    ordering = ['-id']

    def get_queryset(self):
        # Fetch only accessible data sources
        queryset = super().get_queryset()

        u = self.request.user
        g = list(u.groups.all())

        if u.is_anonymous:
            return PretrainedModel.objects.filter(
                accessibility=PretrainedModel.ACCESSIBILITY_PUBLIC
            )

        queryset = queryset.filter(
            Q(owner=u) |
            Q(accessibility=PretrainedModel.ACCESSIBILITY_PUBLIC) |
            (
                Q(accessibility=PretrainedModel.ACCESSIBILITY_INTERNAL) &
                (Q(shared_users__in=[u]) | Q(shared_groups__in=g))
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
        context['num_of_owned'] = num_of_owned
        context['num_of_shared'] = num_of_all - num_of_owned

        return context

    def get_table_data(self):
        return self.get_queryset()


class PretrainedModelDetailView(
    PermissionRequiredMixin, ModelFormMixin, DetailView
):
    model = PretrainedModel
    pk_url_kwarg = 'id'
    permission_required = 'prediction.read_model'
    form_class = PredictionForm

    inputs = None
    outputs = None

    def get_success_url(self):
        url = reverse_lazy('prediction:model-detail',
                           kwargs={'id': self.object.id})
        return url

    def get_object(self):
        try:
            my_object = PretrainedModel.objects.get(id=self.kwargs.get('id'))
            return my_object
        except self.model.DoesNotExist:
            raise Http404("No MyModel matches the given query.")


    def get_form_kwargs(self, *args, **kwargs):
        kwargs = super().get_form_kwargs(
            *args, **kwargs)
        return kwargs


    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # context['form'] = self.get_form()

        context['file'] = context['object'].file
        context['metadata'] = context['object'].metadata

        context['outputs'] = {'name': context['metadata']['outports'][0]['name']}

        if self.inputs:
            context['inputs'] = self.inputs
        if self.outputs:
            context['outputs'] = self.outputs

        return context

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        form = self.get_form()
        if form.is_valid():
            return self.form_valid(form)
        else:
            return self.form_invalid(form)

    def form_valid(self, form):
        #put logic here
        logger.debug(form.fields)
        logger.debug(form.cleaned_data)

        out = self.object.predict(form.cleaned_data)
        logger.info(out)
        self.inputs = form.cleaned_data
        self.outputs = out

        context = self.get_context_data(form=form)
        context['inputs'] = form.cleaned_data
        context['outputs'] = {'name': self.object.metadata['outports'][0]['name'], 'value': out}
        return self.render_to_response(context)

        # return super().form_valid(form)

    def form_invalid(self, form):
        #put logic here
        return super().form_invalid(form)


class PretrainedModelUpdateView(
    PermissionRequiredMixin, PModelActionMixin, UpdateView
):
    model = PretrainedModel
    form_class = PretrainedModelForm
    pk_url_kwarg = 'id'
    template_name = 'prediction/model_update.html'
    success_msg = 'The pretrained model is updated.'
    permission_required = 'prediction.change_model'

    # fields = ('name', 'description', 'file', 'accessibility',
    #           'shared_users', 'shared_groups', 'users_hidden', 'groups_hidden', )


class PretrainedModelDeleteView(PermissionRequiredMixin, DeleteView):
    model = PretrainedModel
    pk_url_kwarg = 'id'
    success_url = reverse_lazy('prediction:index')
    permission_required = 'prediction.delete_model'

    def delete(self, request, *args, **kwargs):
        result = super().delete(request, *args, **kwargs)
        messages.success(
            self.request, 'The pretrained model is deleted.')
        return result
