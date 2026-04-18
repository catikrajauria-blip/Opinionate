# Security Specification

## Data Invariants
1. Blogs can only be created/updated by Admins.
2. Comments can be created by anyone, but must match the blog ID.
3. Ratings, Likes, and Views must link to valid blogs.
4. Ratings are between 1 and 5.
5. Subscribers can join but only unsubscribe themselves (or admin).
6. Contact messages are write-only for public, read-only for admin.

## The "Dirty Dozen" Payloads (Examples)
1. Creating a blog as a non-admin.
2. Updating `likesCount` on a blog directly without a corresponding `Like` document (if enforced via existence check, though here we use simple stats).
3. Rating a blog with a score of 6.
4. Using an extremely long string (>1MB) as a user name in comments.
5. Spoofing another user's ID in a `Like` document.
6. Deleting a blog as a public user.
7. Reading all `subscribers` emails as public.
8. Submitting a negative view count.
9. Injecting script tags in the blog summary or comment content (validation should catch size at least).
10. Creating a like for a non-existent blogId.
11. Updating a comment's `blogId` to move it to another blog.
12. Rating the same blog twice with the same userId.

## Tests
Testing will be handled by simulating these scenarios in logic and verifying rejection.
