BerlinWeb::Application.routes.draw do
  devise_for :users

  resources :maps

  resources :games do
    collection do
      get :random
    end
  end

  resources :artificial_intelligences

  resources :users
  
  match 'home' => 'welcome#index'

  match 'doc' => 'doc#index'
  match 'tutorial' => 'doc#tutorial'
  match 'json_request' => 'doc#json_request'
  match 'json_response' => 'doc#json_response'

  root :to => "welcome#index"
end
