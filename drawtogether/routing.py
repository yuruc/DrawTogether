# routing.py
from channels.routing import route
from drawtogether.consumers import *

channel_routing = [
    route("websocket.receive", websocket_receive_game),

    route("websocket.connect", ws_connect_game),
    route("websocket.disconnect", ws_disconnect_game),

]
