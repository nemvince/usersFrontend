import type { PageServerLoad, Actions } from "./$types";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
  const usersData = await fetch("http://localhost:3000/users");
  const users = await usersData.json();

  return {
    users
  }
}

export const actions = {
  addUser: async ({ request }) => {
    const formData = await request.formData();

    const postData = {
      email: formData.get("email"),
      age: Number(formData.get("age")),
    }

    const response = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    if (response.ok) {
      return {
        success: true,
      }
    }

    const respJson = await response.json();
    const errorMessage = respJson.message.join("\n");

    console.log("FUCKED")

    return fail(400, { code: response.status, message: errorMessage });
  },
  deleteUser: async ({ request }) => {
    const formData = await request.formData();
    const id  = formData.get("id");

    const response = await fetch(`http://localhost:3000/users/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      return {
        success: true,
      }
    }

    return fail(400, { code: response.status, message: "Failed to delete user" });
  },
  editUser: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id");
    const email = formData.get("email");
    const age = Number(formData.get("age"));

    const response = await fetch(`http://localhost:3000/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, age }),
    });

    if (response.ok) {
      return {
        success: true,
      }
    }

    return fail(400, { code: response.status, message: "Failed to edit user" });
  },
  editUserProfilePicture: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id");
    
    const response = await fetch(`http://localhost:3000/users/${id}/profile`, {
      method: "PUT",
      body: formData,
    });

    if (response.ok) {
      return {
        success: true,
      }
    }

    return fail(400, { code: response.status, message: "Failed to edit user profile picture" });
  },
  deleteUserProfilePicture: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id");

    const response = await fetch(`http://localhost:3000/users/${id}/profile`, {
      method: "DELETE",
    });

    if (response.ok) {
      return {
        success: true,
      }
    }

    return fail(400, { code: response.status, message: "Failed to delete user profile picture" });
  }
}