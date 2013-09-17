class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :locale
  before_filter :configure_permitted_parameters, if: :devise_controller?
  before_filter :ensure_api_authenticated

  def after_sign_in_path_for resource_or_scope
    if resource_or_scope.is_a?( User ) && resource_or_scope.locale && resource_or_scope.locale !=  I18n.locale
      I18n.locale = resource_or_scope.locale
    end

    super
  end

  def ensure_logged_in
    redirect_to new_session_path(:user), :alert => "Please log in to create a tournament" unless current_user
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

  def ensure_api_authenticated
    return true unless request.format == Mime::JSON
    render :nothing => true, :status => :unauthorized unless current_user
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.for(:sign_up) { |u| u.permit(:username, :email, :password, :password_confirmation) }
    devise_parameter_sanitizer.for(:sign_in) { |u| u.permit(:login, :password, :remember_me) }
  end

  def ensure_can_edit
    can_edit = current_user == resource ||
      (resource.respond_to?(:user) && resource.user == current_user) ||
      resource.organisation.try(:user) == current_user

    unless can_edit
      cannot_edit_resource
    end
  end

  def cannot_edit_resource(r)
    r ||= resource
    respond_to do |format|
      format.json { render :text => "You don't have access to #{action_name} this #{r.class.model_name.human}", :status => :unauthorized }
      format.html { redirect_to(r) }
    end
  end
end
