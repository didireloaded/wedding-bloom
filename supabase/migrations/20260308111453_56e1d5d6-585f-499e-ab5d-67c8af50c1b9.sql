INSERT INTO public.user_roles (user_id, role) 
VALUES ('9b45e1bb-bcb0-4217-9005-9670bc5f4f27', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;