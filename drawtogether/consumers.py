# consumers.py 
import json
from channels import Group
from channels.sessions import channel_session
from channels.auth import channel_session_user, channel_session_user_from_http
from .models import *
import time
import threading
from webapps.settings import *


@channel_session
def ws_connect_game(message):
    message.reply_channel.send({"accept": True})

    game = message['path'].split('/')
    print(message['path'] + "this is message path")
    label = game[2]
    this_game = Game.objects.get(label=label)
    Group('game-' + game[2]).add(message.reply_channel)
    if this_game.in_game >= 2:
        Group('game-' + game[2]).send({"text": (str)(this_game.time_left)})
        this_game.time_left = 60
        this_game.save()
        t = threading.Timer(60.0, update_time, ['game-' + game[2], this_game])
        # update_time(this_game.time_left, 'game-'+game[2], this_game)
        t.start()


def update_time(group, game):
    # game.save()
    Group(group).send({'text': (str)(game.time_left - 60)})


@channel_session
def ws_disconnect_game(message):
    '''
    Group('users').send({
        'text': json.dumps({
            'username': message.user.username,
            'is_logged_in': False
        })
    })
    '''
    message.reply_channel.send({"accept": True})
    game = message['path'].split('/')
    label = game[2]
    this_game = Game.objects.get(label=label)
    # this_game.send_message(MSG_TYPE_LEAVE)
    Group('game-' + game[2]).add(message.reply_channel)
    # Group('game-' + game[2]).send({"text": "404"})
    Group('game-' + game[2]).discard(message.reply_channel)


@channel_session
def websocket_receive_game(message):
    # print("xxxx")
    text = message.content.get('text')
    game = message.content.get('path').split('/')
    # Group('game-'+game[2], channel_layer=message.channel_layer).add(message.reply_channel)
    # print("content", message.content)
    # print(game)
    # print(x, y)

    # New added
    # target = th.target_

    if text:
        # print(message['text'])
        # Group('users').send({"text": message['text']})
        # Group('draw', channel_layer=message.channel_layer).send({"text":message['text']})
        # message.reply_channel.send({"text":message['text']})
        # Group('users').send({"text":message['text']})
        Group('game-' + game[2], channel_layer=message.channel_layer).send({"text": message['text']})


def websocket_receive_chat(message):
    text = message.content.get('text')
    print("content", message.content)
    # print(x, y)
    if text:
        print(message['text'])
        Group('users').send({"text": message['text']})
        # Group('draw', channel_layer=message.channel_layer).send({"text":message['text']})
        # message.reply_channel.send({"text":message['text']})
        # Group('users').send({"text":message['text']})
