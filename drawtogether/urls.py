from django.conf.urls import url, include
from django.contrib import admin
from django.contrib.auth import views as auth_views
from drawtogether import views

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', views.dashboard),
    url(r'^login$', auth_views.login, {'template_name': 'homepages/login.html'}, name='login'),
    url(r'^logout$', auth_views.logout_then_login, name='logout'),
    url(r'^register', views.register, name='register'),
    url(r'^dashboard', views.dashboard, name='dashboard'),
    url(r'^new_game', views.new_game, name='new_game'),
    url(r'^edit', views.show, name='edit'),
    url(r'^global', views.global_stream, name='global'),
    url(r'^user/(\d+)$', views.user_profile, name='user'),
    url(r'^friend', views.friend_stream, name='friend'),
    url(r'^guess/(?P<label>\w+)/(?P<in_game>\d)', views.guess, name='guess'),
    url(r'^draw/(?P<label>\w+)/(?P<in_game>\d)', views.draw, name='draw'),
    url(r'^continue/(?P<label>\w+)/(?P<in_game>\d)', views.continue_game, name='continue_game'),
    url(r'^continueplay', views.continueplay, name='continue'),
    url(r'^win', views.win, name='win'),
    url(r'^loss', views.loss, name='loss'),
    url(r'^quit', views.quit, name='quit'),
    url(r'^skipguess', views.skipguess, name='skipguess'),
    url(r'^another_draw_game', views.another_draw_game, name='another_draw_game'),
    url(r'^photo/(?P<id>\d+)$', views.get_photo, name='photo'),
    url(r'^like/(?P<id>\d+)$', views.like, name='addlike'),
    url(r'^addfriend/(?P<id>\d+)$', views.addfriend, name='addfriend'),
    url(r'^delfriend/(?P<id>\d+)$', views.delfriend, name='delfriend'),
    url(r'^practice', views.practice, name="random"),
    url(r'^exit', views.exit, name="exit"),
]
