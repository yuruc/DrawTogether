from django.shortcuts import render
from drawtogether.forms import *
from drawtogether.models import *
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.core.exceptions import ObjectDoesNotExist
from django.core.urlresolvers import reverse
from django.core import serializers
from django.views.decorators.csrf import ensure_csrf_cookie
# Decorator to use built-in authentication system
from django.contrib.auth.decorators import login_required
# Used to create and manually log in a user
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate
# Django transaction system so we can use @transaction.atomic
from django.db import transaction
from django.contrib.auth import get_user_model, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.core.urlresolvers import reverse, reverse_lazy
from django.shortcuts import render, redirect
from haikunator import Haikunator
import random
import string
from django.views.decorators.csrf import csrf_exempt


# Create your views here.
@login_required
def home(request):
    return render(request, "homepages/login.html")


@transaction.atomic
def register(request):
    context = {}
    errors = []
    context['errors'] = errors
    if request.method == "GET":
        return render(request, 'homepages/register.html')
    if not 'username' in request.POST or not request.POST['username']:
        errors.append('Username is required.')
    else:
        context['username'] = request.POST['username']
    if not 'firstname' in request.POST or not request.POST['firstname']:
        errors.append('First Name is required.')
    if not 'lastname' in request.POST or not request.POST['lastname']:
        errors.append('Last Name password is required.')
    if not 'password1' in request.POST or not request.POST['password1']:
        errors.append('Password is required.')
    if not 'password2' in request.POST or not request.POST['password2']:
        errors.append('Confirm password is required.')
    if User.objects.select_for_update().filter(username=request.POST['username']).exists():
        errors.append('Username is already taken')
    if request.POST['password1'] != request.POST['password2']:
        errors.append('Passwords did not match.')
    if errors:
        return render(request, 'homepages/register.html', context)
    new_user = User.objects.create_user(username=request.POST['username'],
                                        password=request.POST['password1'],
                                        first_name=request.POST['firstname'],
                                        last_name=request.POST['lastname'],
                                        email=request.POST['email']
                                        )
    new_user.save()
    new_player = Player(user=new_user, online=True, )
    new_player.save()
    new_user = authenticate(username=request.POST['username'],
                            password=request.POST['password1'],
                            first_name=request.POST['firstname'],
                            last_name=request.POST['lastname'],
                            email=request.POST['email']
                            )
    login(request, new_user)
    new_user.status = 'Online'

    return render(request, "gamepages/dashboard.html")


@login_required
def dashboard(request):
    try:
        context = {}
        player = Player.objects.get(user=request.user)
        print(player.id)
        player_win = player.win_games
        player_loss = player.total_games - player_win
        player_total = player.total_games
        player_rate = 0
        if player_total != 0:
            player_rate = (float(float(player_win) / float(player_total))) * 100
        context = {"win": player_win, "loss": player_loss, "total": player_total, "rate": player_rate}
        return render(request, "gamepages/dashboard.html", context)
    except:
        return render(request, "gamepages/dashboard.html")


@login_required
@csrf_exempt
def new_game(request):
    game = Game.objects.filter(in_game='1')[:1]

    if game.exists():  # non-empty
        # need to check id as well 
        for i in range(1):
            label = game[i].label
        print("new_game_guess", label)
        in_game = 1
        return redirect(guess, label=label, in_game=in_game)
    # if every game is full, create a new game
    # the first person who go into the game
    print("draw")
    new_game = None
    while not new_game:
        with transaction.atomic():
            h = Haikunator()
            label = h.haikunate(delimiter='_')
            if Game.objects.filter(label=label).exists():
                continue
            new_game = Game.objects.create(label=label, in_game='1')
            target_list = ["box", "house", "star", "rocket", "glasses", "tree", "boat", "flower", "bee", "rabbit",
                           "car", "airplane", "lamp", "bonbon", "cat", "bird", "eye", "cloud", "guitar", "castle",
                           "mushroom", "bottle", "bed", "chair", "key", "gun", "phone", "shoe", "book", "train", "pen",
                           "ice cream", "dog", "sun", "moon", "fish", "cheese", "money", "hat", "computer", "squirrel"]

            new_game.target_word = random.choice(target_list)
            new_game.save()
            print(new_game.target_word)
            in_game = 1
    return redirect(draw, label=label, in_game=in_game)


@login_required
@csrf_exempt
def continue_game(request):
    label = request.POST('label')
    in_game = request.POST('in_game')
    if in_game == 1:
        return redirect(guess, label=label, in_game=2)
    else:
        with transaction.atomic():
            h = Haikunator()
            label = h.haikunate(delimiter='_')
            new_game = Game.objects.create(label=label, in_game='1')
            target_list = ["box", "house", "star", "rocket", "glasses", "tree", "boat", "flower", "bee", "rabbit",
                           "car", "airplane", "lamp", "bonbon", "cat", "bird", "eye", "cloud", "guitar", "castle",
                           "mushroom", "bottle", "bed", "chair", "key", "gun", "phone", "shoe", "book", "train", "pen",
                           "ice cream", "dog", "sun", "moon", "fish", "cheese", "money", "hat", "computer", "squirrel"]

            new_game.target_word = random.choice(target_list)
            new_game.save()
            print(new_game.target_word)
        return redirect(draw, label=label, in_game=1)


@login_required
@csrf_exempt
def another_draw_game(request):
    return HttpResponseRedirect(dashboard, content_type='application/json')


def draw(request, label, in_game):
    print("inside draw", request, label)
    game, created = Game.objects.get_or_create(label=label)
    print(game)
    in_game = 1
    return render(request, "gamepages/draw.html", {'game': game, 'in_game': in_game})


def guess(request, label, in_game):
    print("inside guess", request, label)
    try:
        game = Game.objects.get(label=label)
        gamelabel = game.target_word
        game.in_game = 2
        game.save()
        return render(request, "gamepages/guess.html", {'game': game, 'target': gamelabel, 'in_game': 2})
    except:
        return render(request, "gamepages/dashboard.html")


def show(request):
    form = Profile(request.POST)
    return render(request, "socialnetwork/edit_profile.html", {'forms': form})


@login_required
def global_stream(request):
    try:
        if request.method == 'GET':
            form = PostForm()
            images = Image.objects.all()
            context = {'form': form}
            context['images'] = images
            context['likes'] = Like.objects.all()
            return render(request, "socialnetwork/global_stream.html", context)
        form = PostForm(request.POST, request.FILES)
        if not form.is_valid():
            context = {'form': form, 'images': Image.objects.all(), 'likes': Like.objects.all()}
            return render(request, "socialnetwork/global_stream.html", context)
        image = form.cleaned_data['image']
        title = form.cleaned_data['title']
        new_image = Image(image=image,
                          content_type=image.content_type,
                          user=request.user,
                          title=title,
                          )
        new_image.save()
        images = Image.objects.all()
        context = {'images': images, 'form': PostForm(), 'likes': Like.objects.all()}
        return render(request, "socialnetwork/global_stream.html", context)
    except:
        images = Image.objects.all()
        context = {'images': images, 'form': PostForm(), 'likes': Like.objects.all()}
        return render(request, "socialnetwork/global_stream.html", context)


@login_required
def user_profile(request, id):
    errors = []
    images = []
    user_find = []
    context = {}
    context['errors'] = errors
    context['images'] = images
    context['user'] = user_find
    try:
        images = Image.objects.filter(user=id)
        user = User.objects.get(id=id)
        player = Player.objects.get(user=id)
        win = player.win_games
        loss = player.total_games - player.win_games
        total = player.total_games
        rate = 0
        flag = 0
        if total != 0:
            rate = (float(float(win) / float(total))) * 100
        if request.user != user:
            flag = 1
        context = {'user': user, 'win': win, 'loss': loss, 'total': total, 'rate': rate, 'images': images, 'flag': flag}
        return render(request, "socialnetwork/user_profile.html", context)
    except:
        return redirect(reverse('global'))


def search_user(request):
    return render(request, "socialnetwork/search_user.html")


@login_required
def friend_stream(request):
    try:
        context = {}
        player = Player.objects.get(user=request.user)
        users = player.friends.all()
        images = Image.objects.filter(user__in=users)
        context['images'] = images
        return render(request, "socialnetwork/friend_stream.html", context)
    except:
        return redirect(reverse('global'))


def index(request):
    return render(request, "gamepages/dashboard.html")


User = get_user_model()


@login_required
def user_list(request):
    users = User.objects.select_related('logged_in_user')
    for user in users:
        user.status = 'Online' if hasattr(user, 'logged_in_user') else 'Offline'
    return render(request, 'gamepages/dashboard.html', {'users': users})


def log_in(request):
    form = AuthenticationForm()
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            login(request, form.get_user())
            return redirect(reverse('realtime:user_list'))
        else:
            print(form.errors)
    return render(request, 'gamepages/dashboard.html', {'form': form})


@login_required
def log_out(request):
    logout(request)
    return redirect(reverse('realtime:log_in'))


def sign_up(request):
    form = UserCreationForm()
    if request.method == 'POST':
        form = UserCreationForm(data=request.POST)
        if form.is_valid():
            form.save()
            return redirect(reverse('realtime:log_in'))
        else:
            print(form.errors)
    return render(request, 'homepages/register.html', {'form': form})


def continueplay(request):
    print("confirm")
    room = request.GET['room']
    game = Game.objects.get(label=room)
    game.in_game += 1
    game.save()
    response_text = ""
    print(game.in_game)
    return HttpResponse(response_text, content_type='application/json')


def win(request):
    user = request.user
    print(user)
    print(Player.objects.all())
    try:
        player = Player.objects.get(user=user)
        # print("This is user" + player)
        player.win_games += 1
        player.total_games += 1
        player.save()
        print("win=" + str(player.win_games))
        print("total=" + str(player.total_games))
        response_text = ""
        return HttpResponse(response_text, content_type='application/json')
    except:
        print("No user")
        return HttpResponse(response_text, content_type='application/json')


def loss(request):
    user = request.user
    player = Player.objects.get(user=user)
    player.total_games += 1
    player.save()
    print("win=" + str(player.win_games))
    print("total=" + str(player.total_games))
    response_text = ""
    return HttpResponse(response_text, content_type='application/json')


@login_required
def quit(request):
    print("quit");
    users = User.objects.all
    return render(request, "gamepages/dashboard.html", {'users': users})


@login_required
@csrf_exempt
def skipguess(request):
    print("enter")
    label = request.POST['roomlabel']
    word = request.POST['word']
    # print(label);
    # print(word);
    game = Game.objects.get(label=label)
    game.target_word = word
    game.save()
    response_text = ""
    return HttpResponse(response_text, content_type='application/json')


@login_required
def get_photo(request, id):
    try:
        image = Image.objects.get(id=id)
        picture = image.image
        return HttpResponse(picture, content_type=image.content_type)
    except:
        return redirect(reverse('global'))


@login_required
def like(request, id):
    try:
        new_like, created = Like.objects.get_or_create(user=request.user, image=Image.objects.get(id=id))
        if not created:
            images = Image.objects.all()
            context = {'images': images, 'form': PostForm(), 'likes': Like.objects.all()}
            return render(request, "socialnetwork/global_stream.html", context)
        else:
            new_like.status = 1
            new_like.image.num_of_likes += 1
            new_like.save()
            new_like.image.save()
            context = {'images': Image.objects.all(), 'form': PostForm(), 'likes': Like.objects.all()}
            return render(request, "socialnetwork/global_stream.html", context)
    except:
        images = Image.objects.all()
        context = {'images': images, 'form': PostForm(), 'likes': Like.objects.all()}
        return render(request, "socialnetwork/global_stream.html", context)


@login_required
def addfriend(request, id):
    try:
        image = Image.objects.filter(user=id)[0]
        print(image.user.id)
        friend = image.user
        play = Player.objects.get(user=request.user)
        play.friends.add(friend)
        play.save()
        print(play.friends.count())
        return redirect(reverse('global'))
    except:
        return redirect(reverse('global'))


@login_required
def delfriend(request, id):
    try:
        image = Image.objects.filter(user=id)[0]
        unfriend = image.user
        play = Player.objects.get(user=request.user)
        play.friends.remove(unfriend)
        play.save()
        return redirect(reverse('global'))
    except:
        return redirect(reverse('global'))


@login_required
def practice(request):
    try:
        images = Image.objects.all()
        images_list = list(images)
        length = Image.objects.count()
        context = {}
        index = random.randint(0, length - 1)
        image = images_list[index]
        context['image'] = image
        return render(request, "gamepages/guess2.html", context)
    except:
        return redirect(reverse('dashboard'))


@csrf_exempt
@login_required
def exit(request):
    print("hello")
    label = request.POST['roomlabel']
    print(label)
    try:
        label = request.POST['roomlabel']
        print("cc")
        game = Game.objects.get(label=label)
        game.in_game = -1
        game.save()
        print("hi")
        response_text = ""
        return HttpResponse(response_text, content_type='application/json')
    except:
        print("bye")
        return redirect(reverse('dashboard'))
