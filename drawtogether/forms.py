from django import forms
from django.contrib.auth.models import User
from .models import *

MAX_UPLOAD_SIZE = 250000000000000000


# from models import *


class Profile(forms.Form):
    first_name = forms.CharField(max_length=20, label="First Name")
    last_name = forms.CharField(max_length=20, label="Last Name")
    user_name = forms.CharField(max_length=20, label="User Name")
    email = forms.EmailField(max_length=50, label="Email Address")
    password1 = forms.CharField(max_length=200, label="Password", widget=forms.PasswordInput(), required=False)
    password2 = forms.CharField(max_length=200, label="Confirm Password", widget=forms.PasswordInput(), required=False)
    age = forms.IntegerField(max_value=120, min_value=0)
    bio = forms.CharField(max_length=430, widget=forms.Textarea)


class Post(forms.Form):
    content = forms.CharField(max_length=42, label="Create a Post")

    def clean(self):
        cleaned_data = super(Post, self).clean()

        content = cleaned_data.get('content')
        if content and len(content) > 120:
            raise forms.ValidationError("Exceed 120 characters limitation.")
        if content and len(content) == 0:
            raise forms.ValidationError("You can't post empty content.")

        return cleaned_data


class RegistrationForm(forms.Form):
    username = forms.CharField(max_length=20)
    password1 = forms.CharField(max_length=200,
                                label='Password',
                                widget=forms.PasswordInput()
                                )
    password2 = forms.CharField(max_length=200,
                                label='Confirm Password',
                                widget=forms.PasswordInput()
                                )
    email = forms.CharField(max_length=50,
                            widget=forms.EmailInput())

    # Customizes form validation for properties that apply to more
    # than one field.  Overrides the forms.Form.clean function.
    def clean(self):
        # Calls our parent (forms.Form) .clean function, gets a dictionary
        # of cleaned data as a result
        cleaned_data = super(RegistrationForm, self).clean()
        # Confirms that the two password fields match
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords did not match.")
            # We must return the cleaned data we got from our parent.
        return cleaned_data

    # Customizes form validation for the username field.
    def clean_username(self):
        # Confirms that the username is not already present in the
        # User model database.
        username = self.cleaned_data.get('username')
        if User.objects.filter(username__exact=username):
            raise forms.ValidationError("Username is already taken.")
        return username


class PostForm(forms.Form):
    image = forms.FileField()
    title = forms.CharField(max_length=10)

    def clean_image(self):
        image = self.cleaned_data['image']
        if not image:
            raise forms.ValidationError('You must upload a picture')
        if not image.content_type or not image.content_type.startswith('image'):
            raise forms.ValidationError('File type is not image')
        if image.size > 250000:
            raise forms.ValidationError('File too big (max size is {0} bytes)'.format(MAX_UPLOAD_SIZE))
        return image
