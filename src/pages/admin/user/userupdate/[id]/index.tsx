import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useCookies } from 'react-cookie';

type User = {
  id: number;
  username: string;
  email: string;
  no_hp: string;
  role: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const UpdateUser = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [noHp, setNoHp] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cookies] = useCookies(['token']); 

  useEffect(() => {

    if (id) {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${API_URL}/api/users/${id}`, {
            headers: {
              Authorization: `Bearer ${cookies.token}`,
            },
          });
          const { username, email, no_hp, role } = response.data;
          setUsername(username);
          setEmail(email);
          setNoHp(no_hp);
          setRole(role);
          setLoading(false);
        } catch (err) {
          setError('Failed to load user data');
          setLoading(false);
        }
      };
      fetchUserData();
    }
  }, [id, cookies.token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await axios.put(
        `https://xrzwvx14-5000.asse.devtunnels.ms/api/users/${id}`,
        { username, password, email, no_hp: noHp, role },
        {
          headers: {
            Authorization: `Bearer ${cookies.token}`,
          },
        }
      );
      setSuccess('User updated successfully');
      setTimeout(() => {
        router.push('/admin/user'); // Redirect after successful update
      }, 2000);
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Update failed. Please try again.';
      setError(message);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      <button onClick={() => router.push('/admin/user')}>Back</button>
      <h1>Update User</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
          />
        </div>

        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Phone Number:</label>
          <input
            type="text"
            value={noHp}
            onChange={(e) => setNoHp(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="kasir">Kasir</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit">Update User</button>
      </form>

      {success && <p className="text-green-500">{success}</p>}
    </div>
  );
};

export default UpdateUser;


