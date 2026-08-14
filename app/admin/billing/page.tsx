import { AdminBillingTable } from '@/components/AdminBillingTable';
import { AdminPlanManager } from '@/components/AdminPlanManager';
import { AdminPageHead } from '@/components/AdminShell';
import { query } from '@/lib/server-db';
export default async function Billing(){
 const [plans,individuals,orgs]=await Promise.all([
  query(`select code,name,monthly_price,included_members,is_active from billing_plans order by sort_order`),
  query(`select u.id user_id,u.display_name,u.email,null::uuid organization_id,'個人工作者' organization_name,s.plan_code,s.status,s.custom_monthly_price,s.discount_percent,s.free_until,s.comped_forever,s.admin_note from users u join designer_profiles dp on dp.user_id=u.id left join lateral(select * from subscriptions sx where sx.user_id=u.id order by sx.created_at desc limit 1) s on true where u.role in ('designer','salon_owner') and dp.organization_id is null order by u.created_at desc limit 500`),
  query(`select o.id organization_id,o.name organization_name,coalesce(owner.id,m.user_id) user_id,coalesce(owner.display_name,mu.display_name,o.name) display_name,coalesce(owner.email,mu.email,'') email,s.plan_code,s.status,s.custom_monthly_price,s.discount_percent,s.free_until,s.comped_forever,s.admin_note from organizations o left join users owner on owner.id=o.owner_user_id left join lateral(select om.user_id from organization_memberships om where om.organization_id=o.id and om.status='active' order by case om.membership_role when 'owner' then 0 else 1 end,om.joined_at limit 1) m on true left join users mu on mu.id=m.user_id left join lateral(select * from subscriptions sx where sx.organization_id=o.id order by sx.created_at desc limit 1) s on true where o.status='active' order by o.created_at desc limit 500`)
 ]);
 return <div><AdminPageHead eyebrow="BILLING & ENTITLEMENTS" title="方案、收費與特殊權限" description="顧客永久免費。店家／工作室原則上以組織為收費主體；沒有店家的個人服務者才個別計費。你可以直接設定試用、付款、折扣、自訂月費、免費期限或永久免費。"/>
 <section className="admin-panel"><div className="admin-section-title"><div><h3>方案基準</h3><p>方案名稱、月費與可含成員數都可直接由最高管理後台調整，不必改程式。</p></div></div><AdminPlanManager plans={plans.rows as any}/></section>
 <section className="admin-panel"><div className="admin-section-title"><div><h3>店家／工作室收費</h3><p>同一店家若有 5、10 位服務者，建議只管理一筆 organization 訂閱，避免每位員工各收一次。</p></div></div><AdminBillingTable rows={orgs.rows as any} plans={plans.rows as any} subjectType="organization"/></section>
 <section className="admin-panel"><div className="admin-section-title"><div><h3>個人服務者收費</h3><p>只列出沒有加入店家／工作室的獨立服務者。</p></div></div><AdminBillingTable rows={individuals.rows as any} plans={plans.rows as any} subjectType="provider"/></section></div>
}
