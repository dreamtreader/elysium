import cloudinary from "cloudinary";

export const removeImagesByTag = (tag, nextCursor) => {
  cloudinary.v2.api
    .delete_resources_by_tag(tag, {
      ...(nextCursor && { next_cursor: nextCursor }),
    })
    .then((result) => {
      if (result.partial) {
        deleteImagesByTag(tag, result.next_cursor);
      }
    });
};
