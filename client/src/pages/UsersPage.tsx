/**
 * UsersPage
 *
 * Lets museum staff view, invite, and remove users within their museum.
 * Uses the same Card/Button/GoldDivider components as SettingsPage.
 * Museum-scoped: only shows users of the current museum.
 */

import { useState, useEffect } from "react";
import { Trash2, UserPlus, Mail, Shield, Clock } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { GoldDivider } from "../components/ui/GoldDivider";
import { useAuth } from "../context/AuthContext";
import { getUsers, createUser, deleteUser } from "../api/client";
import type { UserRecord } from "../api/client";

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Add user form state ─────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err: any) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setCreating(true);
    try {
      const newUser = await createUser(form);
      setUsers((prev) => [...prev, newUser]);
      setForm({ name: "", email: "", password: "" });
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.error || err.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Remove ${name} from this museum? They will lose access immediately.`,
      )
    )
      return;
    setDeletingId(id);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to remove user");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    color: "var(--text)",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    color: "var(--text-dim)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 6,
  };

  return (
    <div
      className="slide-up"
      style={{
        padding: 32,
        overflow: "auto",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        maxWidth: 760,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 400,
              color: "var(--text)",
              marginBottom: 6,
            }}
          >
            Team Members
          </h2>
          <p style={{ color: "var(--text-dim)", fontSize: 13 }}>
            Manage who has access to{" "}
            <span style={{ color: "var(--text-mid)" }}>
              {currentUser?.museumName}
            </span>
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setShowForm((s) => !s);
            setFormError(null);
          }}
          icon={<UserPlus size={14} />}
        >
          {showForm ? "Cancel" : "Add Member"}
        </Button>
      </div>

      <GoldDivider />

      {/* Add user form */}
      {showForm && (
        <Card style={{ padding: 24, border: "1px solid var(--border-gold)" }}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "var(--gold)",
              marginBottom: 20,
            }}
          >
            New Team Member
          </h3>
          <form
            onSubmit={handleCreate}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {formError && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(184,57,46,0.1)",
                  border: "1px solid rgba(184,57,46,0.3)",
                  borderRadius: 8,
                  color: "#E07060",
                  fontSize: 13,
                }}
              >
                {formError}
              </div>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Jane Smith"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="jane@museum.org"
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Temporary Password</label>
              <input
                required
                type="password"
                minLength={8}
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder="Min. 8 characters"
                style={inputStyle}
              />
              <p
                style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}
              >
                Share this password with the new member — they can change it
                later.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Button variant="primary" disabled={creating}>
                {creating ? "Adding…" : "Add Member"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setFormError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Users list */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: "var(--text)",
              margin: 0,
            }}
          >
            Current Members
          </h3>
          <span
            style={{
              fontSize: 12,
              color: "var(--text-dim)",
              background: "var(--surface2)",
              padding: "3px 10px",
              borderRadius: 20,
              border: "1px solid var(--border)",
            }}
          >
            {users.length} {users.length === 1 ? "member" : "members"}
          </span>
        </div>

        {loading ? (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              color: "var(--text-dim)",
              fontSize: 13,
            }}
          >
            Loading members…
          </div>
        ) : error ? (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              color: "#E07060",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        ) : users.length === 0 ? (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              color: "var(--text-dim)",
              fontSize: 13,
            }}
          >
            No members yet.
          </div>
        ) : (
          <div>
            {users.map((u, idx) => {
              const isSelf = u.id === currentUser?.id;
              return (
                <div
                  key={u.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "16px 24px",
                    borderBottom:
                      idx < users.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                    gap: 16,
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: "var(--gold-dim)",
                      border: "1px solid var(--border-gold)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--gold)",
                      flexShrink: 0,
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {u.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 3,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "var(--text)",
                        }}
                      >
                        {u.name}
                      </span>
                      {isSelf && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: "2px 8px",
                            background: "var(--gold-dim)",
                            border: "1px solid var(--border-gold)",
                            borderRadius: 10,
                            color: "var(--gold)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          You
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 8px",
                          background: "var(--surface2)",
                          border: "1px solid var(--border)",
                          borderRadius: 10,
                          color: "var(--text-dim)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {u.role}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 14,
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--text-dim)",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Mail size={11} />
                        {u.email}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--text-dim)",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Clock size={11} />
                        Joined {formatDate(u.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Delete button */}
                  {!isSelf && (
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      disabled={deletingId === u.id}
                      title="Remove member"
                      style={{
                        padding: "7px 8px",
                        background: "transparent",
                        border: "1px solid transparent",
                        borderRadius: 6,
                        color: "var(--text-dim)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.borderColor = "rgba(184,57,46,0.4)";
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "#E07060";
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "rgba(184,57,46,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.borderColor = "transparent";
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "var(--text-dim)";
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "transparent";
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Info note */}
      <p style={{ fontSize: 12, color: "var(--text-dim)", margin: 0 }}>
        All team members have full access to this museum's collection and
        settings. Role-based permissions can be enabled in a future update.
      </p>
    </div>
  );
}
