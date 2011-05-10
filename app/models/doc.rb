class Doc
  def self.model_name
    # copied from active_model/naming.rb #65
    @_model_name ||= ActiveModel::Name.new( self )
  end
end
