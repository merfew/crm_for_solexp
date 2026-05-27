using System.ComponentModel.DataAnnotations.Schema;

namespace solexp.Model
{
    public class Cours
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_cours { get; set; }
        public string? name { get; set; }
        public string? description { get; set; }
        public int? count_lesson { get; set; }
        public decimal? price_per_class { get; set; }
    }
}
