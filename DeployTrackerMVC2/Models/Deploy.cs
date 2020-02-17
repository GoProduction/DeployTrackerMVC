//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace DeployTrackerMVC2.Models
{
    using System;
    using System.Collections.Generic;

    public partial class Deploy
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Deploy()
        {
            this.Comment = new HashSet<Comment>();
        }
        

        public int depID { get; set; }
        public Nullable<int> feaID { get; set; }
        public Nullable<int> envID { get; set; }
        public Nullable<int> smokeID { get; set; }
        public Nullable<int> statusID { get; set; }
        public Nullable<int> noteID { get; set; }
        public string depVersion { get; set; }
        public Nullable<System.DateTimeOffset> depPlannedDateTime { get; set; }
        public Nullable<System.DateTimeOffset> depStartTime { get; set; }
        public Nullable<System.DateTimeOffset> depEndTime { get; set; }
        public Nullable<int> depTimeDiff { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Comment> Comment { get; set; }
        public virtual DeployEnvironment DeployEnvironment { get; set; }
        public virtual Feature Feature { get; set; }
        public virtual Note Note { get; set; }
        public virtual Smoke Smoke { get; set; }
        public virtual Status Status { get; set; }
    }
    
}