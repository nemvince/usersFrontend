<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import * as Avatar from "$lib/components/ui/avatar";
  import * as Card from "$lib/components/ui/card";
  import * as Sheet from "$lib/components/ui/sheet";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { toggleMode } from "mode-watcher";
  import { invalidateAll } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import { enhance } from "$app/forms";

  import { writable } from "svelte/store";

  const editingUser = writable<any>(null);
  const profilePictureTimestamp = writable(Date.now());
  let sheetOpen = writable(false);

  // svelte-ignore non_reactive_update
  let editUserFormElement: HTMLFormElement;

  // svelte-ignore non_reactive_update
  let profilePictureFormElement: HTMLFormElement;

  // svelte-ignore non_reactive_update
  let deleteProfilePictureFormElement: HTMLFormElement;

  const startEditing = (user: any) => {
    editingUser.set(user);
    sheetOpen.set(true);
  };

  const stopEditing = () => {
    editingUser.set(null);
    sheetOpen.set(false);
  };

  let { data } = $props();
</script>

<main class="container max-w-3xl p-4 flex flex-col gap-4">
  <Card.Root>
    <Card.Header>
      <div class="flex justify-between">
        <h2 class="text-xl font-semibold">User frontend</h2>
        <p class="text-stone-400 dark:text-stone-700">made by Vince</p>
      </div>
    </Card.Header>

    <Card.Content>
      <Button on:click={invalidateAll}>Refresh</Button>
      <Button type="button" variant="secondary" on:click={toggleMode}>
        <span class="hidden dark:block">Light Mode</span>
        <span class="block dark:hidden">Dark Mode</span>
      </Button>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <h2 class="text-xl font-semibold">Create a new User</h2>
    </Card.Header>

    <Card.Content>
      <form
        action="?/addUser"
        method="POST"
        class="flex flex-col gap-4"
        use:enhance={({ formElement }) => {
          return async ({ result }) => {
            if (result.type === "success") {
              formElement.reset();
              invalidateAll();
            } else if (result.type === "failure") {
              const errData = result.data?.message as string;
              const errMessage = errData.replace(/\n/g, ", ");
              toast.error(`${result.status}: ${errMessage}`);
            }
          };
        }}
      >
        <Input name="email" placeholder="E-mail" required />
        <Input type="number" name="age" placeholder="Age" required />

        <Button type="submit" class="ml-auto">Create</Button>
      </form>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <h2 class="text-xl font-semibold">Users</h2>
    </Card.Header>

    <Card.Content>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head class="w-[100px]">Avatar</Table.Head>
            <Table.Head>E-mail</Table.Head>
            <Table.Head>Age</Table.Head>
            <Table.Head class="text-right">Actions</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each data.users as user}
            <Table.Row>
              <Table.Cell>
                <Avatar.Root>
                  <Avatar.Image
                    src="http://localhost:3000/users/{user.id}/profile#{$profilePictureTimestamp}"
                    alt="{user.name}'s profile picture"
                  />
                  <Avatar.Fallback>U</Avatar.Fallback>
                </Avatar.Root>
              </Table.Cell>
              <Table.Cell>
                <span class="font-semibold">
                  {user.email}
                </span>
              </Table.Cell>
              <Table.Cell>{user.age}</Table.Cell>
              <Table.Cell class="text-right">
                <Sheet.Root bind:open={$sheetOpen}>
                  <Sheet.Trigger asChild let:builder>
                    <Button
                      builders={[builder]}
                      variant="default"
                      on:click={() => startEditing(user)}
                    >
                      Edit
                    </Button>
                  </Sheet.Trigger>
                  <Sheet.Content side="bottom">
                    <Sheet.Header>
                      <Sheet.Title>Edit User</Sheet.Title>
                      <Sheet.Description>
                        Make changes to the user's information here.
                      </Sheet.Description>
                    </Sheet.Header>

                    <div class="grid gap-4 py-4">
                      <form
                        bind:this={editUserFormElement}
                        action="?/editUser"
                        method="POST"
                        class="space-y-4"
                        use:enhance={({ formElement }) => {
                          return async ({ result }) => {
                            if (result.type === "success") {
                              formElement.reset();
                              stopEditing();
                              invalidateAll();
                              toast.success("User updated successfully");
                            } else if (result.type === "failure") {
                              const errData = result.data?.message as string;
                              const errMessage = errData.replace(/\n/g, ", ");
                              toast.error(`${result.status}: ${errMessage}`);
                            }
                          };
                        }}
                      >
                        <div class="grid grid-cols-4 items-center gap-4">
                          <Label for="email" class="text-right">E-mail</Label>
                          <Input
                            id="email"
                            name="email"
                            value={$editingUser?.email}
                            class="col-span-3"
                            required
                          />
                        </div>
                        <div class="grid grid-cols-4 items-center gap-4">
                          <Label for="age" class="text-right">Age</Label>
                          <Input
                            id="age"
                            type="number"
                            name="age"
                            value={$editingUser?.age}
                            class="col-span-3"
                            required
                          />
                        </div>
                        <input
                          type="hidden"
                          name="id"
                          value={$editingUser?.id}
                        />
                      </form>

                      <form
                        bind:this={profilePictureFormElement}
                        action="?/editUserProfilePicture"
                        method="POST"
                        enctype="multipart/form-data"
                        class="space-y-4"
                        use:enhance={({ formElement }) => {
                          return async ({ result }) => {
                            if (result.type === "success") {
                              formElement.reset();
                              invalidateAll();
                              profilePictureTimestamp.set(Date.now());
                              stopEditing();
                              toast.success("Profile picture updated!");
                            } else if (result.type === "failure") {
                              const errData = result.data?.message as string;
                              const errMessage = errData.replace(/\n/g, ", ");
                              toast.error(`${result.status}: ${errMessage}`);
                            }
                          };
                        }}
                      >
                        <input
                          type="hidden"
                          name="id"
                          value={$editingUser?.id}
                        />
                        <div class="grid grid-cols-4 items-center gap-4">
                          <Label for="profilePicture" class="text-right"
                            >Profile Picture</Label
                          >
                          <Input
                            id="profilePicture"
                            type="file"
                            name="file"
                            accept="image/*"
                            class="col-span-3"
                            required
                          />
                        </div>
                      </form>

                      <form
                        bind:this={deleteProfilePictureFormElement}
                        action="?/deleteUserProfilePicture"
                        method="POST"
                        class="space-y-4"
                        use:enhance={({ formElement }) => {
                          return async ({ result }) => {
                            if (result.type === "success") {
                              invalidateAll();
                              stopEditing();
                              profilePictureTimestamp.set(Date.now());
                              toast.success("Profile picture deleted");
                            } else if (result.type === "failure") {
                              const errData = result.data?.message as string;
                              const errMessage = errData.replace(/\n/g, ", ");
                              toast.error(`${result.status}: ${errMessage}`);
                            }
                          };
                        }}
                      >
                        <input
                          type="hidden"
                          name="id"
                          value={$editingUser?.id}
                        />
                      </form>

                      <Sheet.Footer class="mt-4 flex gap-2 justify-end">
                        <Sheet.Close asChild let:builder>
                          <Button
                            builders={[builder]}
                            variant="secondary"
                            type="button"
                          >
                            Cancel
                          </Button>
                        </Sheet.Close>

                        <Button
                          type="button"
                          on:click={() => {
                            if (editUserFormElement)
                              editUserFormElement.requestSubmit();
                          }}
                        >
                          Save Changes
                        </Button>

                        <Button
                          type="button"
                          on:click={() => {
                            if (profilePictureFormElement)
                              profilePictureFormElement.requestSubmit();
                          }}
                          variant="outline"
                        >
                          Upload Profile Picture
                        </Button>

                        <Button
                          type="button"
                          on:click={() => {
                            if (deleteProfilePictureFormElement)
                              deleteProfilePictureFormElement.requestSubmit();
                          }}
                          variant="destructive"
                        >
                          Delete Profile Picture
                        </Button>
                      </Sheet.Footer>
                    </div>
                  </Sheet.Content>
                </Sheet.Root>

                <form
                  action="?/deleteUser"
                  method="post"
                  class="inline ml-2"
                  use:enhance={() => {
                    return async ({ result }) => {
                      if (result.type === "success") {
                        invalidateAll();
                        toast.success("User deleted successfully");
                      } else if (result.type === "failure") {
                        toast.error("Failed to delete user");
                      }
                    };
                  }}
                >
                  <input type="hidden" name="id" value={user.id} />
                  <Button type="submit" variant="destructive">Delete</Button>
                </form>
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </Card.Content>
  </Card.Root>
</main>
