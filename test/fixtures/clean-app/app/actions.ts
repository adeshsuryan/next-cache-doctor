export async function saveProduct() {
  await updateTag("products:123");
}

export function afterSave() {
  router.refresh();
}
