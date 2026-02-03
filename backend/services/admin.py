from supabase import create_client, Client
import os
from typing import Optional, Dict, Any

class AdminService:
    """
    Administrative service using the Service Role Key.
    WARNING: Use only for owner-authorized actions.
    """
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        # Note: We need the SERVICE_ROLE_KEY to manage users
        service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not service_key:
            print("WARNING: SUPABASE_SERVICE_ROLE_KEY not found. Admin actions will fail.")
            self.client = None
        else:
            self.client = create_client(url, service_key)

    async def create_user(self, email: str, password: str, full_name: str, role: str) -> Dict[str, Any]:
        """
        Creates a user in Supabase Auth and the profiles table.
        """
        if not self.client:
            return {"status": "error", "message": "Service role key missing"}

        try:
            # Create in Auth
            auth_response = self.client.auth.admin.create_user({
                "email": email,
                "password": password,
                "user_metadata": {"full_name": full_name, "role": role},
                "email_confirm": True
            })
            
            # The trigger handle_new_user should automatically create the profile.
            # But we can verify or explicitly update it if needed.
            
            return {"status": "success", "user": auth_response.user}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def delete_user(self, user_id: str) -> Dict[str, Any]:
        """
        Deletes a user from Auth (cascades to profile).
        """
        if not self.client:
            return {"status": "error", "message": "Service role key missing"}

        try:
            self.client.auth.admin.delete_user(user_id)
            return {"status": "success"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

admin_service = AdminService()
