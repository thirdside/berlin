BerlinWeb::Application.routes.draw do
  devise_for :users

  resources :maps, :likes, :notifications

  resources :users do
    member do
      get :artificial_intelligences
      get :games
    end
  end

  resources :games do
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

  resources :tournaments do
    resources :rounds do
    end
  end

  get 'home', :to => 'welcome#index'

  get 'doc',            :to => 'doc#doc'
  get 'tutorial',       :to => 'doc#tutorial'
  get 'json_request',   :to => 'doc#json_request'
  get 'json_response',  :to => 'doc#json_response'

  root :to => "welcome#index"
end
