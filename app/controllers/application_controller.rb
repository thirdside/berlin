class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :locale

  def after_sign_in_path_for resource_or_scope
    if resource_or_scope.is_a?( User ) && resource_or_scope.locale && resource_or_scope.locale !=  I18n.locale
      I18n.locale = resource_or_scope.locale
    end

    super
  end

  protected
    def locale
      if params[:locale]
        if I18n.available_locales.include?( params[:locale].to_sym )
          # session
          session[:locale] = params[:locale]

          # user
          if current_user
            current_user.update_attribute :locale, params[:locale]
          end
        end
      end
      
      I18n.locale = session[:locale] || I18n.default_locale
    end
end
