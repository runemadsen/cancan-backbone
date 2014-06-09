do (Backbone) ->
  Post = Backbone.Model.extend(
    defaults:
      title: "Hello!"
      body: "This is a blog post!"
  ,
    backboneClass: "Post"
  )
  Comment = Backbone.Model.extend(
    defaults:
      body: "This is a comment!"
  ,
    backboneClass: "Comment"
  )
  test "should work when passing in existing object with rules and subjects", ->
    existing = rules: [
      {
        base_behavior: true
        subjects: ["Post"]
        actions: [
          "index"
          "show"
        ]
        conditions:
          id: 1
      }
      {
        base_behavior: true
        subjects: ["Comment"]
        actions: [
          "index"
          "show"
          "new"
          "create"
        ]
        conditions:
          post_id: 1
      }
    ]
    a = new Ability(existing)
    ok a.can("index", Post)
    ok a.can("index", new Post(id: 1))
    ok a.cannot("index", new Post(id: 2))
    ok a.cannot("destroy", Post)
    ok a.can("new", Comment)
    ok a.can("new", new Comment(post_id: 1))
    ok a.cannot("new", new Comment(post_id: 2))
    return

  test "should work on backbone model", ->
    a = new Ability()
    a.set_can "read", Post
    ok a.can("read", Post)
    return

  test "should work on backbone model name as string", ->
    a = new Ability()
    a.set_can "read", Post
    ok a.can("read", "Post")
    return

  test "should work on backbone model name as string the other way around", ->
    a = new Ability()
    a.set_can "read", "Post"
    ok a.can("read", Post)
    return

  test "should be able to 'read' anything", ->
    a = new Ability()
    a.set_can "read", "all"
    ok a.can("read", String)
    ok a.can("read", 123)
    return

  test "should not have permission to do something it doesn't know about", ->
    a = new Ability()
    ok a.cannot("foodfight", String)
    return

  test "should alias update or destroy actions to modify action", ->
    a = new Ability()
    a.alias_action [
      "update"
      "destroy"
    ], "modify"
    a.set_can "modify", "all"
    ok a.can("update", 123)
    ok a.can("destroy", 123)
    return

  test "should allow deeply nested aliased actions", ->
    a = new Ability()
    a.alias_action ["increment"], "sort"
    a.alias_action ["sort"], "modify"
    a.set_can "modify", "all"
    ok a.can("increment", 123)
    return

  test "should raise an Error if alias target is an exist action", ->
    a = new Ability()
    throws (->
      a.alias_action ["show"], "show"
      return
    ), "You can't specify target (show) as alias because it is real action name"
    return

  test "should automatically alias index and show into read calls", ->
    a = new Ability()
    a.set_can "read", "all"
    ok a.can("index", 123)
    ok a.can("show", 123)
    return

  test "should automatically alias new and edit into create and update respectively", ->
    a = new Ability()
    a.set_can "create", "all"
    a.set_can "update", "all"
    ok a.can("new", 123)
    ok a.can("edit", 123)
    return

  test "should offer cannot? method which is simply invert of can?", ->
    a = new Ability()
    ok a.cannot("tie", String)
    return

  test "should be able to specify multiple actions and match any", ->
    a = new Ability()
    a.set_can [
      "read"
      "update"
    ], "all"
    ok a.can("read", 123)
    ok a.can("update", 123)
    ok a.cannot("count", 123)
    return

  test "should be able to specify multiple classes and match any instances", ->
    a = new Ability()
    a.set_can "update", [
      Post
      Comment
    ]
    ok a.can("update", new Post())
    ok a.can("update", new Comment())
    ok a.cannot("update", new RegExp())
    return

  test "should be able to specify multiple classes and match any classes", ->
    a = new Ability()
    a.set_can "update", [
      Post
      Comment
    ]
    ok a.can("update", Post)
    ok a.can("update", Comment)
    ok a.cannot("update", RegExp)
    return

  test "should support custom objects in the rule", ->
    a = new Ability()
    a.set_can "read", "stats"
    ok a.can("read", "stats")
    ok a.cannot("update", "stats")
    ok a.cannot("read", "nonstats")
    return

  test "should support 'cannot' method to define what user cannot do", ->
    a = new Ability()
    a.set_can "read", "all"
    a.set_cannot "read", Post
    ok a.can("read", "foo")
    ok a.cannot("read", new Post())
    return

  test "should append aliased actions", ->
    a = new Ability()
    a.alias_action ["update"], "modify"
    a.alias_action ["destroy"], "modify"
    ok _.isEqual([
      "update"
      "destroy"
    ], a.get("aliased_actions")["modify"])
    return

  test "should clear aliased actions", ->
    a = new Ability()
    a.alias_action ["update"], "modify"
    a.clear_aliased_actions()
    equal `undefined`, a.get("aliased_actions")["modify"]
    return

  test "should use conditions as third parameter and determine abilities from it", ->
    a = new Ability()
    a.set_can "read", Post,
      title: "Hello"

    ok a.can("read", new Post(title: "Hello"))
    ok a.cannot("read", new Post(title: "Goodbye"))
    ok a.can("read", Post)
    return

  test "should allow an array of options in conditions hash", ->
    a = new Ability()
    a.set_can "read", Post,
      tags: [
        "awesome"
        "cool"
        "pretty"
      ]

    ok a.can("read", new Post(tags: [
      "awesome"
      "cool"
      "pretty"
    ]))
    ok a.cannot("read", new Post(tags: [
      "ugly"
      "bad"
    ]))
    ok a.can("read", Post)
    return

  test "should allow nested hashes in conditions hash", ->
    a = new Ability()
    a.set_can "read", Post,
      comment:
        user_id: 1

    ok a.can("read", new Post(comment:
      user_id: 1
    ))
    ok a.cannot("read", new Post(comment:
      user_id: 2
    ))
    return

  test "should allow false values conditions hash", ->
    a = new Ability()
    a.set_can "read", Post,
      comment:
        is_protected: false

    ok a.can("read", new Post(comment:
      is_protected: false
    ))
    ok a.cannot("read", new Post(comment:
      is_protected: true
    ))
    return

  test "should not stop at cannot definition when comparing class", ->
    a = new Ability()
    a.set_can "read", Post
    a.set_cannot "read", Post,
      id: 1

    ok a.can("read", new Post(id: 2))
    ok a.cannot("read", new Post(id: 1))
    ok a.can("read", Post)
    return

  test "should stop at cannot definition when no hash is present", ->
    a = new Ability()
    a.set_can "read", "all"
    a.set_cannot "read", Post
    ok a.cannot("read", new Post())
    ok a.cannot("read", Post)
    return
