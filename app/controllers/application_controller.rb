class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :locale

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
