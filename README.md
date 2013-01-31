CanCan for Backbone.js
======================

This is a libary that makes it possible to pass your CanCan abilities to JS.

In order to make it work, you need to declare a class_name() method on your backbone models that return the class name in string form (e.g. "Comment").

You can then check it like this:

.can("read", "Comment");