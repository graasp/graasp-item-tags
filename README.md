# graasp-item-tags

API to allow members to tag items.

Tags are useful to implement logic in the context of a (sub) tree hierarchy.

Two examples of this are the `graasp-public-items` and `graasp-item-login`.

* `graasp-public-items` installs a couples of endpoints that check if the 'public' tag exists in a certain item, and if that's the case, it returns the content - no need to be logged in.

* `graasp-item-login` also installs a couple of endpoints which allows a "non-member" to access some content by creating a member "on the spot" which has  a membership for that specific content. This logic is enabled for items tagged as 'item-login'.
