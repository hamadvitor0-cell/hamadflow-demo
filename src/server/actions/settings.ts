"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { formString } from "@/lib/utils";
import { settingsSchema } from "@/lib/validations";
import { DEMO_USER_EMAIL, isDemoMode } from "@/lib/demo";

export async function updateSettingsAction(formData: FormData) {
  const user = await requireUser();
  const parsed = settingsSchema.safeParse({
    name: formString(formData, "name"),
    brandName: formString(formData, "brandName"),
    email: formString(formData, "email"),
    phone: formString(formData, "phone"),
    website: formString(formData, "website"),
    document: formString(formData, "document"),
    logoUrl: formString(formData, "logoUrl"),
    footerText: formString(formData, "footerText"),
    pixKey: formString(formData, "pixKey"),
    currency: formString(formData, "currency") || "BRL",
  });

  if (!parsed.success) redirect("/dashboard/settings?error=invalid");

  await getPrisma().user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      brandName: parsed.data.brandName,
      email: isDemoMode() ? DEMO_USER_EMAIL : parsed.data.email,
      phone: parsed.data.phone || null,
      website: parsed.data.website || null,
      document: isDemoMode() ? null : parsed.data.document || null,
      logoUrl: parsed.data.logoUrl || null,
      footerText: parsed.data.footerText || null,
      pixKey: isDemoMode() ? null : parsed.data.pixKey || null,
      currency: parsed.data.currency || "BRL",
    },
  });

  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?updated=1");
}
