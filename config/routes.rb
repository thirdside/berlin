BerlinWeb::Application.routes.draw do
  devise_for :users

  resources :maps

  resources :games

  resources :artificial_intelligences

  resources :users
  
  match 'home' => 'welcome#index'

  match 'doc' => 'doc#index'

  root :to => "welcome#index"
end
