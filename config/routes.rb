BerlinWeb::Application.routes.draw do
  devise_for :users

  resources :maps, :users, :likes

  resources :games do
    collection do
      get :random
    end
  end

  resources :artificial_intelligences do
    member do
      get :ping
    end
  end
  
  match 'home' => 'welcome#index'

  match 'doc' => 'doc#doc'
  match 'tutorial' => 'doc#tutorial'
  match 'json_request' => 'doc#json_request'
  match 'json_response' => 'doc#json_response'

  root :to => "welcome#index"
end
