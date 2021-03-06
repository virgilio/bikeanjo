# -*- coding: utf-8 -*-
from django.utils.translation import ugettext as _
from import_export import resources, fields
from front import models
from cyclists.models import User


class UserResource(resources.ModelResource):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'date_joined', 'last_login',
                  'gender', 'birthday', 'role', 'help_with', 'available', 'city', 'country', 'accepted_agreement',)
        export_order = ('first_name', 'last_name', 'email', 'date_joined', 'last_login',
                        'gender', 'birthday', 'role', 'help_with', 'available', 'city', 'country', 'accepted_agreement',)

    def dehydrate_help_with(self, obj):
        if obj.role == 'requester':
            return ''
        return ' / '.join([str(label) for label in obj.help_labels()])


class NewsletterResource(resources.ModelResource):
    class Meta:
        model = models.Subscriber
        fields = ('created_date', 'email', 'valid',)


class FeedbackResource(resources.ModelResource):
    created_date = fields.Field(column_name=_('Created date'))
    author_name = fields.Field(column_name=_('Name'))
    author_role = fields.Field(column_name=_('Role'))
    message = fields.Field(column_name=_('Message'))

    class Meta:
        model = models.Feedback
        fields = ('created_date', 'message',)
        export_order = ('created_date', 'author_name', 'author_role', 'message',)

    def dehydrate_created_date(self, obj):
        return obj.created_date.strftime('%d/%m/%Y')

    def dehydrate_author_name(self, obj):
        return obj.author.get_full_name()

    def dehydrate_author_role(self, obj):
        return _(obj.author.role.title())

    def dehydrate_message(self, obj):
        return obj.message
