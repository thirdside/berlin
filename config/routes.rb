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

  root :to => "welcome#index"
end
