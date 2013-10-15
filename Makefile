.PHONY: clean

import =  curl -X PUT -u foo:tester -H 'Content-Type: $(3)' --data-binary @$(2) \
		`echo http://foo.tiddlyspace.org:8080/bags/$(1)/tiddlers/$(2) | perl -pe 's/\.(html|css)//'`

update:
		cd src && \
			ls *.html | while read item; do $(call import,foo_public,$$item,text/html); done
		cd src/js && \
			ls *.js | while read item; do $(call import,foo_public,$$item,text/javascript); done