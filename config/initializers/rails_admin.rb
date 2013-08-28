# RailsAdmin.authenticate_with {
#   redirect_to root_path unless current_user.try(:is_admin?)
# }