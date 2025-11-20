import { usePurchaseOrderStore } from "@/store/usePurchaseOrderStore";
import { supabase } from "@/lib/supabase";

export const useFetchInitialData = () => {
  const {
    setPurchaseOrders,
    setProducts,
    setReceiving,
    setSuppliers,
    setBranches,
    setLineDiscounts,
    setTaxRates,
  } = usePurchaseOrderStore();

  const fetchInitialData = async () => {
    try {
      // Fetch all data from Supabase
      const [
        { data: poData },
        { data: productData },
        { data: receivingData },
        { data: suppliersData },
        { data: branchesData },
        { data: lineDiscountsData },
        { data: taxRatesData },
      ] = await Promise.all([
        supabase.from("purchase_order").select("*"),
        supabase.from("purchase_order_products").select("*"),
        supabase.from("purchase_order_receiving").select("*"),
        supabase.from("suppliers").select("*"),
        supabase.from("branches").select("*"),
        supabase.from("line_discount").select("*"),
        supabase.from("tax_rates").select("*"),
      ]);

      setPurchaseOrders(poData || []);
      setProducts(productData || []);
      setReceiving(receivingData || []);
      setSuppliers(suppliersData || []);
      setBranches(branchesData || []);
      setLineDiscounts(lineDiscountsData || []);

      if (taxRatesData && taxRatesData.length > 0) {
        setTaxRates({
          VATRate: parseFloat(taxRatesData[0].VATRate) || 0,
          WithholdingRate: parseFloat(taxRatesData[0].WithholdingRate) || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  return { fetchInitialData };
};
