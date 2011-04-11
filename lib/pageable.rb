module Pageable
  private
    def collection
      instance_variable_get( "@#{controller_name}" ) || instance_variable_set( "@#{controller_name}", end_of_association_chain.page(params[:page]) )
    end
end