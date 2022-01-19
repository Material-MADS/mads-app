#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Jun Fujima (Former Lead Developer) [2018-2021]
#          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) common folder contains all base-root reusable codes that are
#              shared and used by all various "apps" within this web site. This file contains
#              custom template tags used by various 'templates'.
# ------------------------------------------------------------------------------------------------
# Notes: This is 'common' code that support various apps and files with all reusable features
#        that is needed for the different pages Django provides
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries and markdown libs
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django import template
from django.utils.safestring import mark_safe
import markdown
from markdownx.utils import markdownify
from markdownx.settings import (
    MARKDOWNX_MARKDOWN_EXTENSIONS,
    MARKDOWNX_MARKDOWN_EXTENSION_CONFIGS
)
from markdown.extensions import Extension

import re

#-------------------------------------------------------------------------------------------------

register = template.Library()

#-------------------------------------------------------------------------------------------------
@register.filter
def markdown_to_html(text):
    return mark_safe(markdownify(text))
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class EscapeHtml(Extension):
    def extendMarkdown(self, md):
        md.preprocessors.deregister('html_block')
        md.inlinePatterns.deregister('html')
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
@register.filter
def markdown_to_html_with_escape(text):
    extensions = MARKDOWNX_MARKDOWN_EXTENSIONS + [EscapeHtml()]
    html = markdown.markdown(text, extensions=extensions, extension_configs=MARKDOWNX_MARKDOWN_EXTENSION_CONFIGS)
    return mark_safe(html)
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def cut(value, arg):
    """Removes all values of arg from the given string"""
    return value.replace(arg, '')
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def lower(value): # Only one argument.
    """Converts a string into all lowercase"""
    return value.lower()
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def escape_dot(value):
    # return value.replace('.', '__')
    return re.sub(r'\.', '__', value)
#-------------------------------------------------------------------------------------------------

register.filter('cut', cut)
register.filter('lower', lower)
register.filter('escape_dot', escape_dot)
