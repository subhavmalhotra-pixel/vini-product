import type { User } from "./schema";

/** Mercedes Benz Laguna Niguel dealership users — drawn from the customer-call transcript. */
export const ROOFTOP_ID = "mb-laguna-niguel";

export const USERS: User[] = [
  {
    user_id: "u-edgar",
    display_name: "Edgar Ceniceros",
    email: "edgar@mblagunaniguel.com",
    role: "general_manager",
    avatar_initials: "EC",
    rooftop_id: ROOFTOP_ID,
  },
  {
    user_id: "u-anya",
    display_name: "Anya Kim",
    email: "anya@mblagunaniguel.com",
    role: "service_manager",
    avatar_initials: "AK",
    rooftop_id: ROOFTOP_ID,
  },
  {
    user_id: "u-lane",
    display_name: "Lane Becker",
    email: "lane@mblagunaniguel.com",
    role: "sales_manager",
    avatar_initials: "LB",
    rooftop_id: ROOFTOP_ID,
  },
  {
    user_id: "u-trevor",
    display_name: "Trevor Diaz",
    email: "trevor@mblagunaniguel.com",
    role: "bdc_manager",
    avatar_initials: "TD",
    rooftop_id: ROOFTOP_ID,
  },
  {
    user_id: "u-marcus",
    display_name: "Marcus Reid",
    email: "marcus@mblagunaniguel.com",
    role: "bdc_agent",
    avatar_initials: "MR",
    rooftop_id: ROOFTOP_ID,
  },
  {
    user_id: "u-priya",
    display_name: "Priya Shah",
    email: "priya@mblagunaniguel.com",
    role: "service_advisor",
    avatar_initials: "PS",
    rooftop_id: ROOFTOP_ID,
  },
  {
    user_id: "u-david",
    display_name: "David Park",
    email: "david@mblagunaniguel.com",
    role: "sales_advisor",
    avatar_initials: "DP",
    rooftop_id: ROOFTOP_ID,
  },
  {
    user_id: "vini_agent",
    display_name: "Vini (AI)",
    email: "vini@spyne.ai",
    role: "bdc_agent",
    avatar_initials: "AI",
    rooftop_id: ROOFTOP_ID,
  },
];

/** Logged-in user for the prototype (Anya, the Service Manager — the daily power user). */
export const CURRENT_USER_ID = "u-anya";
