module Subclasses
  def subclasses direct = false
    classes = []

    if direct
      ObjectSpace.each_object(Class) do |c|
        classes << c if c.superclass == self
      end
    else
      ObjectSpace.each_object(Class) do |c|
        classes << c if c.ancestors.include?(self) and (c != self)
      end
    end

    classes
  end
end