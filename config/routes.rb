BerlinWeb::Application.routes.draw do
  devise_for :users

  resources :maps

  resources :games

  resources :artificial_intelligences

  resources :users

  match 'doc' => 'doc#index'

  root :to => "artificial_intelligences#index"
end
