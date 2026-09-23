
CREATE POLICY "diners can view restaurant images"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('restaurant-assets', 'menu-images'));
