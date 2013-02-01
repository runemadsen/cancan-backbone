(function() {

  /* Ability 
  ----------------------------------------------------------------- */

  var root = this;

  root.Ability = Backbone.Model.extend({

    defaults : function() {
      return {
        //def rules
        //  @rules ||= []
        //end
    
        rules : [],
    
        //def aliased_actions
        //  @aliased_actions ||= default_alias_actions
        //end
    
        //def default_alias_actions
        //  {
        //    :read => [:index, :show],
        //    :create => [:new],
        //    :update => [:edit],
        //  }
        //end
    
        aliased_actions : {
          read : ["index", "show"],
          create : ["new"],
          update : ["edit"]
        }
      }
    },
    
    //def can?(action, subject, *extra_args)
    //  match = relevant_rules_for_match(action, subject).detect do |rule|
    //    rule.matches_conditions?(action, subject, extra_args)
    //  end
    //  match ? match.base_behavior : false
    //end

    can : function(action, subject)
    {
      var match = _.detect(this.relevant_rules(action, subject), function(rule)
      {
        return rule.matches_conditions(action, subject)
      }, this);

      return match ? match.get("base_behavior") : false;
    },

    //def cannot?(*args)
    //  !can?(*args)
    //end

    cannot : function(action, subject)
    {
      return !this.can(action, subject);
    },

    //def can(action = nil, subject = nil, conditions = nil, &block)
    //  rules << Rule.new(true, action, subject, conditions, block)
    //end

    set_can : function(action, subject, conditions)
    {
      this.get("rules").push(new Rule({base_behavior:true, action:action, subject:subject, conditions:conditions}));
    },

    //def cannot(action = nil, subject = nil, conditions = nil, &block)
    //  rules << Rule.new(false, action, subject, conditions, block)
    //end

    set_cannot : function(action, subject, conditions)
    {
      this.get("rules").push(new Rule({base_behavior:false, action:action, subject:subject, conditions:conditions}));
    },

    //def alias_action(*args)
    //  target = args.pop[:to]
    //  validate_target(target)
    //  aliased_actions[target] ||= []
    //  aliased_actions[target] += args
    //end
    //
    //  should be called like this: alias_action(["update", "destroy"], "modify")
    //

    alias_action : function(from, target)
    {
      this.validate_target(target);
      if(!_.isArray(this.get("aliased_actions")[target])) this.get("aliased_actions")[target] = [];
      this.get("aliased_actions")[target] = this.get("aliased_actions")[target].concat(from);
    },

    //def validate_target(target)
    //  raise Error, "You can't specify target (#{target}) as alias because it is real action name" if aliased_actions.values.flatten.include? target
    //end

    validate_target : function(target)
    {
      if(_.chain(this.get("aliased_actions")).values().flatten().include(target).value())
      {
        throw new Error("You can't specify target ("+target+") as alias because it is real action name");
      }
    },

    //def clear_aliased_actions
    //  @aliased_actions = {}
    //end

    clear_aliased_actions : function()
    {
      this.set("aliased_actions", {});
    },

    //def model_adapter(model_class, action)
    //  adapter_class = ModelAdapters::AbstractAdapter.adapter_class(model_class)
    //  adapter_class.new(model_class, relevant_rules_for_query(action, model_class))
    //end

    // # See ControllerAdditions#authorize! for documentation.
    //def authorize!(action, subject, *args)
    //  message = nil
    //  if args.last.kind_of?(Hash) && args.last.has_key?(:message)
    //    message = args.pop[:message]
    //  end
    //  if cannot?(action, subject, *args)
    //    message ||= unauthorized_message(action, subject)
    //    raise AccessDenied.new(message, action, subject)
    //  end
    //  subject
    //end

    //def unauthorized_message(action, subject)
    //  keys = unauthorized_message_keys(action, subject)
    //  variables = {:action => action.to_s}
    //  variables[:subject] = (subject.class == Class ? subject : subject.class).to_s.underscore.humanize.downcase
    //  message = I18n.translate(nil, variables.merge(:scope => :unauthorized, :default => keys + [""]))
    //  message.blank? ? nil : message
    //end

    //def attributes_for(action, subject)
    //  attributes = {}
    //  relevant_rules(action, subject).map do |rule|
    //    attributes.merge!(rule.attributes_from_conditions) if rule.base_behavior
    //  end
    //  attributes
    //end

    //def has_block?(action, subject)
    //  relevant_rules(action, subject).any?(&:only_block?)
    //end

    //def has_raw_sql?(action, subject)
    //  relevant_rules(action, subject).any?(&:only_raw_sql?)
    //end

    //def merge(ability)
    //  ability.send(:rules).each do |rule|
    //    rules << rule.dup
    //  end
    //  self
    //end

    //private

    //def unauthorized_message_keys(action, subject)
    //  subject = (subject.class == Class ? subject : subject.class).name.underscore unless subject.kind_of? Symbol
    //  [subject, :all].map do |try_subject|
    //    [aliases_for_action(action), :manage].flatten.map do |try_action|
    //      :"#{try_action}.#{try_subject}"
    //    end
    //  end.flatten
    //end

    //# Accepts an array of actions and returns an array of actions which match.
    //# This should be called before "matches?" and other checking methods since they
    //# rely on the actions to be expanded.
    //def expand_actions(actions)
    //  actions.map do |action|
    //    aliased_actions[action] ? [action, *expand_actions(aliased_actions[action])] : action
    //  end.flatten
    //end

    expand_actions : function(actions)
    {
      return _.chain(actions).map(function(action) {
        if(this.get("aliased_actions")[action])
        {
          return [action].concat(this.expand_actions(this.get("aliased_actions")[action]));
        }
        else
        {
          return action;
        }
      }, this).flatten().value();
    },

    //# Given an action, it will try to find all of the actions which are aliased to it.
    //# This does the opposite kind of lookup as expand_actions.
    //def aliases_for_action(action)
    //  results = [action]
    //  aliased_actions.each do |aliased_action, actions|
    //    results += aliases_for_action(aliased_action) if actions.include? action
    //  end
    //  results
    //end

    //# Returns an array of Rule instances which match the action and subject
    //# This does not take into consideration any hash conditions or block statements
    //def relevant_rules(action, subject)
    //  rules.reverse.select do |rule|
    //    rule.expanded_actions = expand_actions(rule.actions)
    //    rule.relevant? action, subject
    //  end
    //end

    relevant_rules : function(action, subject)
    {
      var reversed_rules = this.get("rules").slice(0);
      return _.select(reversed_rules.reverse(), function(rule)
      {
        rule.set("expanded_actions", this.expand_actions(rule.get("actions")));
        return rule.is_relevant(action, subject);
      }, this);
    }

    //def relevant_rules_for_match(action, subject)
    //  relevant_rules(action, subject).each do |rule|
    //    if rule.only_raw_sql?
    //      raise Error, "The can? and cannot? call cannot be used with a raw sql 'can' definition. The checking code cannot be determined for #{action.inspect} #{subject.inspect}"
    //    end
    //  end
    //end

    //def relevant_rules_for_query(action, subject)
    //  relevant_rules(action, subject).each do |rule|
    //    if rule.only_block?
    //      raise Error, "The accessible_by call cannot be used with a block 'can' definition. The SQL cannot be determined for #{action.inspect} #{subject.inspect}"
    //    end
    //  end
    //end

  });

  /* Rule 
  ----------------------------------------------------------------- */

  root.Rule = Backbone.Model.extend({

    //attr_reader :base_behavior, :subjects, :actions, :conditions
    
    //attr_writer :expanded_actions

    //# The first argument when initializing is the base_behavior which is a true/false
    //# value. True for "can" and false for "cannot". The next two arguments are the action
    //# and subject respectively (such as :read, @project). The third argument is a hash
    //# of conditions and the last one is the block passed to the "can" call.
    //def initialize(base_behavior, action, subject, conditions, block)
    //  raise Error, "You are not able to supply a block with a hash of conditions in #{action} #{subject} ability. Use either one." if conditions.kind_of?(Hash) && !block.nil?
    //  @match_all = action.nil? && subject.nil?
    //  @base_behavior = base_behavior
    //  @actions = [action].flatten
    //  @subjects = [subject].flatten
    //  @conditions = conditions || {}
    //  @block = block
    //end

    initialize : function()
    {
      this.set("actions", _.flatten([this.get("action")]));
      this.set("subjects", _.flatten([this.get("subject")]));
      if(!this.get("conditions"))
      {
        this.set("conditions", {});
      }
    },

    //# Matches both the subject and action, not necessarily the conditions
    //def relevant?(action, subject)
    //  subject = subject.values.first if subject.class == Hash
    //  @match_all || (matches_action?(action) && matches_subject?(subject))
    //end

    is_relevant : function(action, subject)
    {
      return this.matches_action(action) && this.matches_subject(subject);
    },

    //# Matches the block or conditions hash
    //def matches_conditions?(action, subject, extra_args)
    //  if @match_all
    //    call_block_with_all(action, subject, extra_args)
    //  elsif @block && !subject_class?(subject)
    //    @block.call(subject, *extra_args)
    //  elsif @conditions.kind_of?(Hash) && subject.class == Hash
    //    nested_subject_matches_conditions?(subject)
    //  elsif @conditions.kind_of?(Hash) && !subject_class?(subject)
    //    matches_conditions_hash?(subject)
    //  else
    //    # Don't stop at "cannot" definitions when there are conditions.
    //    @conditions.empty? ? true : @base_behavior
    //  end
    //end

    matches_conditions : function(action, subject)
    {
      if(_.isObject(this.get("conditions")))
      {
        return this.matches_conditions_hash(subject);
      }
      else
      {
        return _.isEmpty(this.get("conditions")) ? true : this.get("base_behavior");
      }
    },

    //def only_block?
    //  conditions_empty? && !@block.nil?
    //end

    //def only_raw_sql?
    //  @block.nil? && !conditions_empty? && !@conditions.kind_of?(Hash)
    //end

    //def conditions_empty?
    //  @conditions == {} || @conditions.nil?
    //end

    //def unmergeable?
    //  @conditions.respond_to?(:keys) && @conditions.present? &&
    //    (!@conditions.keys.first.kind_of? Symbol)
    //end

    //def associations_hash(conditions = @conditions)
    //  hash = {}
    //  conditions.map do |name, value|
    //    hash[name] = associations_hash(value) if value.kind_of? Hash
    //  end if conditions.kind_of? Hash
    //  hash
    //end

    //def attributes_from_conditions
    //  attributes = {}
    //  @conditions.each do |key, value|
    //    attributes[key] = value unless [Array, Range, Hash].include? value.class
    //  end if @conditions.kind_of? Hash
    //  attributes
    //end

    //private

    //def subject_class?(subject)
    //  klass = (subject.kind_of?(Hash) ? subject.values.first : subject).class
    //  klass == Class || klass == Module
    //end

    //def matches_action?(action)
    //  @expanded_actions.include?(:manage) || @expanded_actions.include?(action)
    //end

    matches_action : function(action)
    {
      return _.include(this.get("expanded_actions"), "manage") || _.include(this.get("expanded_actions"), action)
    },

    //def matches_subject?(subject)
    //  @subjects.include?(:all) || @subjects.include?(subject) || matches_subject_class?(subject)
    //end

    matches_subject : function(subject)
    {
      return _.include(this.get("subjects"), "all") || _.include(this.get("subjects"), subject) || this.matches_subject_class(subject)
    },

    //def matches_subject_class?(subject)
    //  @subjects.any? { |sub| sub.kind_of?(Module) && (subject.kind_of?(sub) || subject.class.to_s == sub.to_s || subject.kind_of?(Module) && subject.ancestors.include?(sub)) }
    //end
    //
    // JS doesn't have class types, so you need to have a function called class_name on your models that return the class name if passing in an object

    matches_subject_class : function(subject)
    {
      return _.any(this.get("subjects"), function(sub) {
        // if both are backbone objects (either class or instance) implementing class_name
        var sub_class     = sub.class_name || sub.constructor.class_name;
        var subject_class = subject.class_name || subject.constructor.class_name;
        return sub_class && subject_class && sub_class == subject_class;
      });
    },

    //# Checks if the given subject matches the given conditions hash.
    //# This behavior can be overriden by a model adapter by defining two class methods:
    //# override_matching_for_conditions?(subject, conditions) and
    //# matches_conditions_hash?(subject, conditions)
    //def matches_conditions_hash?(subject, conditions = @conditions)
    //  if conditions.empty?
    //    true
    //  else
    //    if model_adapter(subject).override_conditions_hash_matching? subject, conditions
    //      model_adapter(subject).matches_conditions_hash? subject, conditions
    //    else
    //      conditions.all? do |name, value|
    //        if model_adapter(subject).override_condition_matching? subject, name, value
    //          model_adapter(subject).matches_condition? subject, name, value
    //        else
    //          attribute = subject.send(name)
    //          if value.kind_of?(Hash)
    //            if attribute.kind_of? Array
    //              attribute.any? { |element| matches_conditions_hash? element, value }
    //            else
    //              !attribute.nil? && matches_conditions_hash?(attribute, value)
    //            end
    //          elsif value.kind_of?(Enumerable)
    //            value.include? attribute
    //          else
    //            attribute == value
    //          end
    //        end
    //      end
    //    end
    //  end
    //end

    matches_conditions_hash : function(subject, conditions)
    {
      if(!conditions) conditions = this.get("conditions");

      if(_.isEmpty(conditions))
      {
        return true;
      }
      else
      {
        return _.all(conditions, function(name, value) {

          var attribute = subject[name];

          if(_.isObject(value) && !_.isArray(value))
          {
            if(_.isArray(attribute))
            {
              return _.any(attribute, function(element) {
                this.matches_conditions_hash(element, value);
              }, this);
            }
            else
            {
              return attribute && this.matches_conditions_hash(attribute, value);
            }
          }
          else if(_.isArray(value))
          {
            return _.include(value, attribute);
          }
          else
          {
            return attribute == value;
          }
        }, this);
      }
    }

    //def nested_subject_matches_conditions?(subject_hash)
    //  parent, child = subject_hash.first
    //  matches_conditions_hash?(parent, @conditions[parent.class.name.downcase.to_sym] || {})
    //end

    //def call_block_with_all(action, subject, extra_args)
    //  if subject.class == Class
    //    @block.call(action, subject, nil, *extra_args)
    //  else
    //    @block.call(action, subject.class, subject, *extra_args)
    //  end
    //end

    //def model_adapter(subject)
    //  CanCan::ModelAdapters::AbstractAdapter.adapter_class(subject_class?(subject) ? subject : subject.class)
    //end

  });


}).call(this);