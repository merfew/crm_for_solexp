using System.ComponentModel.DataAnnotations.Schema;

namespace solexp.Model
{
    public class Account_transaction
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_transaction { get; set; }
        public int id_client { get; set; }
        public int id_student { get; set; }
        public string? type { get; set; }
        public decimal amount { get; set; }
        public string? payment_method { get; set; }
        public DateTime? transaction_date { get; set; }
    }
}
