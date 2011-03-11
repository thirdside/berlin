BerlinWeb::Application.routes.draw do
  devise_for :users

  resources :maps

  resources :games

  resources :artificial_intelligences

  resources :users

  root :to => "users#index"
end
