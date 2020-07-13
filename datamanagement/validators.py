from django.core.exceptions import ValidationError


def validate_users_hidden(value):
    """Raise a ValidationError if the value includes unregistered users.
    """
    msg = 'The user is not registered.'
    raise ValidationError(msg, 'test')


def validate_groups_hidden(value):
    pass



