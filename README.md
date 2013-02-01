CanCan for Backbone.js
======================

Real-world web applications often rely on a combination of server-side and client-side code. If you're building a Rails application, you're probably relying on an access control library like CanCan, and a JS framwork like Backbone.js for client side rendering.

This library makes it possible to export your CanCan abilities from Ruby to JS, and do the same access checks on the client side. This is great for doing UI-specific functionality, but should of course be backed by an API with tight access control.

The JS code was adapted directly from the CanCan Ruby code, but without Ruby-specific functionality like blocks, etc. See the tests for coverage.


Setup
-----

First Drop the cancan-backbone.js file in your assets folder.

Then in you Backbone models, implement a class_name var:

```
var Comment = Backbone.Model.extend({}, {class_name:"Comment"});
```

In your controller/helper, implement a method that exports you abilities to JSON. This looks something like this:

```
def ability_to_array(a)
  	a.instance_variable_get("@rules").collect{ |rule| 
      { 
      	:base_behavior => rule.instance_variable_get("@base_behavior"),
        :subjects => rule.instance_variable_get("@subjects").map { |s| s.to_s }, 
        :actions => rule.instance_variable_get("@actions").map { |a| a.to_s },
        :conditions => rule.instance_variable_get("@conditions")
      }
    }
  end
```

... and can be used like this:

```
@js_abilities = ability_to_array(current_ability)
```

In your view, you can now pass the abilities into js:

```
var ability = new Ability({rules : <%= @js_abilities.to_json.html_safe %>});
````

Usage
------------

If you already loaded your abilities into your model, you're all ready to check for access:

```
ability.can("read", Comment);
ability.can("read", "custom");
ability.can("read", new Comment());
```

If you want to set abilities from JS, you need to use the set_ functions:

```
ability.set_can("read", Comment, {id:1});
ability.set_can("read", "somethingelse");
```

It's also possible to pass the name of your Backbone models as strings. It will still work:

```
ability.set_can("index", "Comment");
ability.can("index", Comment)  // => true
ability.can("index", "Comment")  // => true

ability.set_can("index", Post);
ability.can("index", Post)  // => true
ability.can("index", "Post")  // => true
```

Obviously, you need the class_name of your backbone models to correspond to your Rails models.