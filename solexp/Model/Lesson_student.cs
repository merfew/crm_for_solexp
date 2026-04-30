using System.ComponentModel.DataAnnotations.Schema;

namespace solexp.Model
{
    public class Lesson_student
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_lesson_student { get; set; }
        public int id_lesson { get; set; }
        public int id_student { get; set; }
        public string? attendance_status { get; set; }
        public int? homework_percent { get; set; }
        public int? score { get; set; }
        public string? feedback { get; set; }
        public DateTime created_at { get; set; }
    }
}
