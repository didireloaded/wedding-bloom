
DO $$
DECLARE
  new_uid uuid := gen_random_uuid();
  existing_uid uuid;
BEGIN
  SELECT id INTO existing_uid FROM auth.users WHERE email = 'admin@forevervow.test';
  IF existing_uid IS NULL THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_uid, 'authenticated', 'authenticated',
      'admin@forevervow.test', crypt('ForeverVow2026!', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Studio Admin"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), new_uid, jsonb_build_object('sub', new_uid::text, 'email', 'admin@forevervow.test'), 'email', new_uid::text, now(), now(), now());
    existing_uid := new_uid;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (existing_uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
END $$;
