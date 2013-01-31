test( "should be able to 'read' anything", function() {
	var a = new Ability();
	a.set_can("read", "all");
	ok( a.can("read", String) );
	ok( a.can("read", 123) );
});