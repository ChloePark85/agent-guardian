-- Function to increment scan count
CREATE OR REPLACE FUNCTION increment_scan_count(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET scans_used_this_month = scans_used_this_month + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
