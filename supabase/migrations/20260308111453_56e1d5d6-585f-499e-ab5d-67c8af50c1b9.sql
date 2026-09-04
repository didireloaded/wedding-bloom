INSERT INTO public.user_roles (user_id, role)
SELECT '9b45e1bb-bcb0-4217-9005-9670bc5f4f27', 'admin'
WHERE EXISTS (
  SELECT 1 FROM auth.users
  WHERE id = '9b45e1bb-bcb0-4217-9005-9670bc5f4f27'
)
ON CONFLICT (user_id, role) DO NOTHING;
