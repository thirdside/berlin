BerlinWeb::Application.routes.draw do
  mount RailsAdmin::Engine => '/admin', :as => 'rails_admin'
  devise_for :users


  resources :maps, :likes, :notifications

  resources :organisations, :only => [] do
    resources :users
    resources :tournaments
  end

  resources :tournaments do
    member do
      get :artificial_intelligence_games
    end

    resources :rounds do
      # resources :games
    end
  end

  resources :users do
    member do
      get :artificial_intelligences
      get :games
    end
  end

  resources :games do
    member do
      get :rematch
    end

    collection do
      get :random
    end
  end

  resources :artificial_intelligences do
    member do
      get :ping
      post :ping
    end
  end

  get 'home', :to => 'welcome#index'

  get 'doc',            :to => 'doc#doc'
  get 'tutorial',       :to => 'doc#tutorial'
  get 'json_request',   :to => 'doc#json_request'
  get 'json_response',  :to => 'doc#json_response'

  root :to => "welcome#index"
end
