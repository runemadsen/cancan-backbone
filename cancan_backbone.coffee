(->
  root = this

  # Ability
  #  -----------------------------------------------------------------
  root.Ability = Backbone.Model.extend(
    defaults: ->
      rules: []
      aliased_actions:
        read: [
          "index"
          "show"
        ]
        create: ["new"]
        update: ["edit"]

    initialize: (attributes, options = {}) ->
      @options = options
      @options.rule ?= options.rule
      unless _.isEmpty(@get("rules"))
        @set "rules", _.map(@get("rules"), (rule) =>
          new Rule(rule, @options.rule)
        )
      return

    can: (action, subject) ->
      match = _.detect(@relevant_rules(action, subject), (rule) ->
        rule.matches_conditions action, subject
      , this)
      (if match then match.get("base_behavior") else false)

    cannot: (action, subject) ->
      not @can(action, subject)

    set_can: (action, subject, conditions) ->
      @get("rules").push new Rule(
        {
          base_behavior: true
          action: action
          subject: subject
          conditions: conditions
        }, @options.rule
      )
      return

    set_cannot: (action, subject, conditions) ->
      @get("rules").push new Rule(
        {
          base_behavior: false
          action: action
          subject: subject
          conditions: conditions
        }, @options.rule
      )
      return

    alias_action: (from, target) ->
      @validate_target target
      @get("aliased_actions")[target] = []  unless _.isArray(@get("aliased_actions")[target])
      @get("aliased_actions")[target] = @get("aliased_actions")[target].concat(from)
      return

    validate_target: (target) ->
      throw new Error("You can't specify target (" + target + ") as alias because it is real action name")  if _.chain(@get("aliased_actions")).values().flatten().include(target).value()
      return

    clear_aliased_actions: ->
      @set "aliased_actions", {}
      return

    expand_actions: (actions) ->
      _.chain(actions).map((action) ->
        if @get("aliased_actions")[action]
          [action].concat @expand_actions(@get("aliased_actions")[action])
        else
          action
      , this).flatten().value()

    relevant_rules: (action, subject) ->
      reversed_rules = @get("rules").slice(0)
      _.select reversed_rules.reverse(), ((rule) ->
        rule.set "expanded_actions", @expand_actions(rule.get("actions"))
        rule.is_relevant action, subject
      ), this
  )
  # Rule
  #  -----------------------------------------------------------------
  root.Rule = Backbone.Model.extend(
    initialize: (attributes, options = {}) ->
      (@options = options).backboneClass ?= 'backboneClass' # or pass a function.

      @set "actions", _.flatten([@get("action")])  if not @get("actions") and @get("action")
      @set "subjects", _.flatten([@get("subject")])  if not @get("subjects") and @get("subject")
      @set "conditions", {}  unless @get("conditions")
      return

    backbone_class: (sub = null) ->
      if _.isString(@options.backboneClass)
        sub?[@options.backboneClass]
      else if _.isFunction(@options.backboneClass)
        @options.backboneClass(sub)


    is_relevant: (action, subject) ->
      @matches_action(action) and @matches_subject(subject)

    matches_conditions: (action, subject) ->
      if _.isObject(@get("conditions")) and not _.isEmpty(@get("conditions")) and not @subject_class(subject)
        @matches_conditions_hash subject
      else
        (if _.isEmpty(@get("conditions")) then true else @get("base_behavior"))

    subject_class: (subject) ->
      (if @backbone_class(subject) then true else false)

    matches_action: (action) ->
      _.include(@get("expanded_actions"), "manage") or _.include(@get("expanded_actions"), action)

    matches_subject: (subject) ->
      _.include(@get("subjects"), "all") or _.include(@get("subjects"), subject) or @matches_subject_class(subject)

    matches_subject_class: (subject) ->
      # if both are backbone objects (either class or instance) implementing backboneClass
      _.any @get("subjects"), (sub) =>
        sub_class = @backbone_class(sub) or @backbone_class(sub.constructor)
        subject_class = @backbone_class(subject) or @backbone_class(subject.constructor)
        (sub_class and subject_class and sub_class is subject_class) or sub is subject_class or sub_class is subject


    matches_conditions_hash: (subject, conditions) ->
      conditions = @get("conditions")  unless conditions
      if _.isEmpty(conditions)
        true
      else
        _.all conditions, ((value, name) ->
          attribute = subject[name]
          attribute = subject.get(name)  if _.isUndefined(attribute)
          if _.isObject(value) and not _.isArray(value)
            if _.isArray(attribute)
              _.any attribute, ((element) ->
                @matches_conditions_hash element, value
                return
              ), this
            else
              attribute and @matches_conditions_hash(attribute, value)
          else if _.isArray(value)
            _.include(value, attribute) or _.isEqual(value, attribute)
          else
            attribute is value
        ), this
  )
  return
).call this